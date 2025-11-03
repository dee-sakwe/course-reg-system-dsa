import { EventInput } from '@fullcalendar/core';
import { Course } from '../types';

// Map day abbreviations to day numbers (0=Sunday, 1=Monday, etc.)
const dayMap: Record<string, number> = {
  'Sun': 0,
  'S': 0,
  'Mon': 1,
  'M': 1,
  'Tue': 2,
  'T': 2,
  'Wed': 3,
  'W': 3,
  'Thu': 4,
  'Th': 4,
  'R': 4, // Sometimes used for Thursday
  'Fri': 5,
  'F': 5,
  'Sat': 6
};

/**
 * Parse time string (e.g., "10:00AM" or "1:30PM") to hours and minutes
 */
function parseTime(timeStr: string): { hours: number; minutes: number } | null {
  const trimmed = timeStr.trim();
  
  // Match pattern like "10:00AM" or "1:30PM"
  const match = trimmed.match(/(\d{1,2}):(\d{2})(AM|PM)/i);
  if (!match) {
    console.warn('parseTime: Could not match time pattern', trimmed);
    return null;
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();

  // Convert to 24-hour format
  if (ampm === 'PM' && hours !== 12) {
    hours += 12;
  } else if (ampm === 'AM' && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

/**
 * Parse day string (e.g., "MWF", "T", "MW", "TR") to array of day numbers
 */
function parseDays(daysStr: string): number[] {
  const days: number[] = [];
  const upperDays = daysStr.toUpperCase().trim();

  // Handle concatenated days like "MWF", "TR", "MW"
  // Try to match common patterns first
  if (upperDays.includes('SUN')) days.push(0);
  if (upperDays.includes('MON')) days.push(1);
  if (upperDays.includes('TUE')) days.push(2);
  if (upperDays.includes('WED')) days.push(3);
  if (upperDays.includes('THU') || upperDays.includes('TH')) days.push(4);
  if (upperDays.includes('FRI')) days.push(5);
  if (upperDays.includes('SAT')) days.push(6);

  // If no matches, try single characters
  if (days.length === 0) {
    for (const char of upperDays) {
      if (dayMap[char] !== undefined) {
        const dayNum = dayMap[char];
        if (!days.includes(dayNum)) {
          days.push(dayNum);
        }
      }
    }
  }

  return days.sort();
}

/**
 * Parse schedule string to extract days and time range
 */
function parseSchedule(schedule: string): { days: number[]; startTime: string; endTime: string } | null {
  if (!schedule || !schedule.trim()) {
    console.warn('parseSchedule: Empty schedule string');
    return null;
  }

  // Split by space - first part is days, second part is time
  const parts = schedule.trim().split(/\s+/);
  if (parts.length < 2) {
    console.warn('parseSchedule: Invalid format, expected "Days TimeRange"', schedule);
    return null;
  }

  const daysStr = parts[0];
  const timeStr = parts.slice(1).join(' '); // Join in case time has spaces

  const days = parseDays(daysStr);
  if (days.length === 0) {
    console.warn('parseSchedule: No valid days found', daysStr, schedule);
    return null;
  }

  // Parse time range
  const timeParts = timeStr.split('-');
  if (timeParts.length !== 2) {
    console.warn('parseSchedule: Invalid time range format', timeStr, schedule);
    return null;
  }

  const startTime = parseTime(timeParts[0].trim());
  const endTime = parseTime(timeParts[1].trim());

  if (!startTime || !endTime) {
    console.warn('parseSchedule: Failed to parse time', {
      start: timeParts[0].trim(),
      end: timeParts[1].trim(),
      schedule
    });
    return null;
  }

  // Format as HH:MM:SS for FullCalendar
  const startTimeStr = `${String(startTime.hours).padStart(2, '0')}:${String(startTime.minutes).padStart(2, '0')}:00`;
  const endTimeStr = `${String(endTime.hours).padStart(2, '0')}:${String(endTime.minutes).padStart(2, '0')}:00`;

  return { days, startTime: startTimeStr, endTime: endTimeStr };
}

/**
 * Generate recurring events for a course over a semester period
 */
function generateRecurringEvents(
  course: Course,
  days: number[],
  startTime: string,
  endTime: string,
  startDate: Date,
  endDate: Date
): EventInput[] {
  const events: EventInput[] = [];
  const currentDate = new Date(startDate);

  // Generate events for each day of the week over the semester duration
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();

    if (days.includes(dayOfWeek)) {
      // Create event for this day
      const eventDate = new Date(currentDate);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      eventDate.setHours(startHours, startMinutes, 0, 0);
      const endDateTime = new Date(eventDate);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      events.push({
        id: `${course.id}-${eventDate.toISOString()}`,
        title: `${course.code}: ${course.name}`,
        start: eventDate.toISOString(),
        end: endDateTime.toISOString(),
        extendedProps: {
          courseId: course.id,
          courseCode: course.code,
          instructor: course.instructor,
        },
      });
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return events;
}

/**
 * Parse course schedules into FullCalendar events
 * @param courses Array of enrolled courses
 * @param startDate Semester start date (defaults to current date)
 * @param endDate Semester end date (defaults to 14 weeks from start)
 * @returns Array of FullCalendar EventInput objects
 */
export function parseScheduleToEvents(
  courses: Course[],
  startDate?: Date,
  endDate?: Date
): EventInput[] {
  const now = new Date();
  
  // Default to start of current week (Monday) for better calendar visibility
  let semesterStart = startDate;
  if (!semesterStart) {
    semesterStart = new Date(now);
    // Get Monday of current week (Monday = 1, Sunday = 0)
    const day = semesterStart.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday is 1, so subtract to get to Monday
    semesterStart = new Date(semesterStart);
    semesterStart.setDate(semesterStart.getDate() + diff);
    semesterStart.setHours(0, 0, 0, 0);
  }
  
  const semesterEnd = endDate || (() => {
    const end = new Date(semesterStart);
    end.setDate(end.getDate() + (14 * 7)); // 14 weeks
    return end;
  })();

  console.log('parseScheduleToEvents: Semester dates', {
    start: semesterStart.toISOString(),
    end: semesterEnd.toISOString(),
    courseCount: courses.length
  });

  const allEvents: EventInput[] = [];

  for (const course of courses) {
    const parsed = parseSchedule(course.schedule);
    
    if (!parsed) {
      // If schedule cannot be parsed, skip this course
      console.warn(`Could not parse schedule for course ${course.code}: ${course.schedule}`);
      continue;
    }

    const events = generateRecurringEvents(
      course,
      parsed.days,
      parsed.startTime,
      parsed.endTime,
      semesterStart,
      semesterEnd
    );

    console.log(`Generated ${events.length} events for course ${course.code}`);
    allEvents.push(...events);
  }

  console.log(`parseScheduleToEvents: Total events generated: ${allEvents.length}`);
  return allEvents;
}

