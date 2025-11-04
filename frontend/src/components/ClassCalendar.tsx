import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventContentArg } from '@fullcalendar/core';
import { Course } from '../types';
import { parseScheduleToEvents } from '../utils/scheduleParser';

interface ClassCalendarProps {
  courses: Course[];
  loading?: boolean;
  initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';
  height?: string | number;
}

const ClassCalendar: React.FC<ClassCalendarProps> = ({
  courses,
  loading = false,
  initialView = 'timeGridWeek',
  height = 'auto',
}) => {
  const events = React.useMemo(() => {
    if (!courses || courses.length === 0) {
      console.log('ClassCalendar: No courses provided');
      return [];
    }
    const parsedEvents = parseScheduleToEvents(courses);
    console.log('ClassCalendar: Parsed events', {
      courseCount: courses.length,
      eventCount: parsedEvents.length,
      events: parsedEvents.slice(0, 5), // Log first 5 events
      courses: courses.map(c => ({ code: c.code, schedule: c.schedule }))
    });
    return parsedEvents;
  }, [courses]);

  // Custom event content renderer to ensure text is fully visible and centered
  const renderEventContent = (eventInfo: EventContentArg) => {
    return (
      <div style={{ 
        minHeight: '2.5em',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '2px 4px',
        overflow: 'visible',
        lineHeight: '1.2',
        height: '100%',
        marginTop: '4px',
        marginBottom: '4px'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '1em' }}>
          {eventInfo.timeText}
        </div>
        <div style={{ fontSize: '0.95em', wordBreak: 'break-word' }}>
          {eventInfo.event.title}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      {loading ? (
        <div>Loading calendar...</div>
      ) : (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          initialView={initialView}
          weekends={true}
          editable={false}
          selectable={false}
          dayMaxEvents={true}
          events={events}
          height={height}
          eventDisplay="block"
          eventContent={renderEventContent}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
          initialDate={new Date()}
          nowIndicator={true}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          slotDuration="00:30:00"
          slotLabelInterval="01:00:00"
          allDaySlot={false}
        />
      )}
    </div>
  );
};

export default ClassCalendar;

