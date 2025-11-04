import { useState, useEffect } from 'react';
import {
  Header,
  SpaceBetween,
  Input,
  Button,
  Alert,
  Pagination,
  CollectionPreferences,
  Cards,
  Badge,
  Box,
  Flashbar,
} from '@cloudscape-design/components';
import { Course } from '../types';
import { courseService, enrollmentService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCollection } from '@cloudscape-design/collection-hooks';
import { studentService } from '../services/api';

// Simple schedule parser for conflict checks (days token + AM/PM timerange)
function parseScheduleBasic(schedule: string): { days: number[]; startMin: number; endMin: number } | null {
  if (!schedule) return null;
  const parts = schedule.trim().split(/\s+/);
  if (parts.length < 2) return null;
  const daysToken = parts[0];
  const timeRange = parts.slice(1).join(' ');
  const [startStr, endStr] = timeRange.split('-').map(s => s.trim());
  if (!startStr || !endStr) return null;

  const toMinutes = (s: string): number | null => {
    const m = s.match(/(\d{1,2}):(\d{2})(AM|PM)/i);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const ampm = m[3].toUpperCase();
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + min;
  };

  const startMin = toMinutes(startStr);
  const endMin = toMinutes(endStr);
  if (startMin == null || endMin == null) return null;

  // Days parsing supports compact forms like MWF, TR, MW, etc.
  const map: Record<string, number> = { S: 0, M: 1, T: 2, W: 3, R: 4, F: 5, U: 0 };
  const days: number[] = [];
  const upper = daysToken.toUpperCase();
  // Handle common multi-letter tokens for Thu
  if (upper.includes('TH')) {
    if (!days.includes(4)) days.push(4);
  }
  for (const ch of upper) {
    const d = map[ch];
    if (d !== undefined && !days.includes(d)) days.push(d);
  }
  if (days.length === 0) return null;

  return { days, startMin, endMin };
}

function timesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

const CourseCatalog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [visibleCourses, setVisibleCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const { currentStudent } = useAuth();
  const [pageSize, setPageSize] = useState<number>(() => {
    const saved = sessionStorage.getItem('courseList.pageSize');
    return saved ? Number(saved) : 10;
  });
  // Track which courses user is enrolled in
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<number>>(new Set());
  // Track current enrolled credits for cap enforcement (<= 21)
  const [currentEnrolledCredits, setCurrentEnrolledCredits] = useState<number>(0);
  // Track eligible courses and missing prerequisites
  const [eligibleCourseIds, setEligibleCourseIds] = useState<Set<number>>(new Set());
  const [missingPrerequisites, setMissingPrerequisites] = useState<Map<number, string[]>>(new Map());
  const [flashMessages, setFlashMessages] = useState<any[]>([]);

  // Fetch user enrolled courses and eligibility (only once for now, could fetch after enroll too)
  useEffect(() => {
    async function fetchEnrolledIdsAndEligibility() {
      if (!currentStudent) {
        setEnrolledCourseIds(new Set());
        setEligibleCourseIds(new Set());
        setMissingPrerequisites(new Map());
        return;
      }
      try {
        const resp = await studentService.getStudentCourses(currentStudent.id.toString());
        setEnrolledCourseIds(new Set(resp.courses.map((c: Course) => c.id)));
        // Sum credits from currently enrolled courses
        const sumCredits = (resp.courses || []).reduce((sum: number, c: Course) => sum + (Number(c.credits) || 0), 0);
        setCurrentEnrolledCredits(sumCredits);
        
        // Fetch eligibility data
        const eligibilityResp = await studentService.getEligibleCourses(
          currentStudent.id.toString(),
          true, // include full courses
          true  // include advisory (courses not eligible yet)
        );
        
        const eligibleSet = new Set<number>();
        const missingMap = new Map<number, string[]>();
        
        eligibilityResp.courses.forEach((course: any) => {
          if (course.eligible) {
            eligibleSet.add(course.id);
          }
          if (course.missing_prerequisites && course.missing_prerequisites.length > 0) {
            // Map missing prerequisites to course codes (strings)
            missingMap.set(course.id, course.missing_prerequisites.map((p: any) => p.code || p.name || String(p)));
          }
        });
        
        setEligibleCourseIds(eligibleSet);
        setMissingPrerequisites(missingMap);
      } catch {
        setEnrolledCourseIds(new Set());
        setEligibleCourseIds(new Set());
        setMissingPrerequisites(new Map());
      }
    }
    fetchEnrolledIdsAndEligibility();
  }, [currentStudent]);

  // Fetch all courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch for refresh or search
  const fetchCourses = async (opts?: { forceRefresh?: boolean }) => {
    setLoading(true);
    setError(null);
    setShowErrorAlert(false);
    try {
      const data = await courseService.getAllCoursesCached({ forceRefresh: opts?.forceRefresh });
      setCourses(data);
      setVisibleCourses(data);
      actions.setCurrentPage(1);
      sessionStorage.setItem('courseList.page', '1');
    } catch (err: any) {
      setError(err.message || 'Failed to load courses');
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // restore cached full list without network
      setVisibleCourses(courses);
      actions.setCurrentPage(1);
      sessionStorage.setItem('courseList.page', '1');
      return;
    }
    setLoading(true);
    setError(null);
    setShowErrorAlert(false);
    try {
      const data = await courseService.searchCourses(searchQuery);
      setVisibleCourses(data);
      actions.setCurrentPage(1);
      sessionStorage.setItem('courseList.page', '1');
    } catch (err: any) {
      setError(err.message || 'Failed to search courses');
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!currentStudent) {
      setError('You must be logged in to enroll in courses');
      setShowErrorAlert(true);
      return;
    }
    
    // Check eligibility before attempting enrollment
    const courseIdNum = Number(courseId);
    const targetCourse = courses.find(c => c.id === courseIdNum);
    const hasPrereqs = !!(targetCourse?.prerequisites && targetCourse.prerequisites.length > 0);
    if (hasPrereqs && !eligibleCourseIds.has(courseIdNum)) {
      const missing = missingPrerequisites.get(courseIdNum) || [];
      const errorMsg = missing.length > 0 
        ? `Missing prerequisites: ${missing.join(', ')}`
        : 'You are not eligible to enroll in this course';
      setError(errorMsg);
      setShowErrorAlert(true);
      setFlashMessages(msgs => ([
        ...msgs,
        { type: 'error', content: errorMsg, id: `error-${Date.now()}` }
      ]));
      return;
    }

    // Enforce credit cap (<= 21)
    const targetCredits = targetCourse ? (Number(targetCourse.credits) || 0) : 0;
    if ((currentEnrolledCredits + targetCredits) > 21) {
      const msg = `Credit limit exceeded: current ${currentEnrolledCredits} + ${targetCredits} > 21`;
      setError(msg);
      setShowErrorAlert(true);
      setFlashMessages(msgs => ([
        ...msgs,
        { type: 'error', content: msg, id: `error-${Date.now()}` }
      ]));
      return;
    }

    // Enforce time conflict check
    if (targetCourse && targetCourse.schedule) {
      const targetParsed = parseScheduleBasic(targetCourse.schedule);
      if (targetParsed) {
        // We need enrolled courses list; fetch latest if not present
        let currentCourses: Course[] = [];
        try {
          const resp = await studentService.getStudentCourses(currentStudent.id.toString());
          currentCourses = resp.courses || [];
        } catch {
          currentCourses = [];
        }
        const conflict = currentCourses.some((ec) => {
          if (!ec.schedule) return false;
          const parsed = parseScheduleBasic(ec.schedule);
          if (!parsed) return false;
          // any shared day and overlapping time
          const sharesDay = parsed.days.some(d => targetParsed.days.includes(d));
          if (!sharesDay) return false;
          return timesOverlap(parsed.startMin, parsed.endMin, targetParsed.startMin, targetParsed.endMin);
        });
        if (conflict) {
          const msg = 'Time conflict: this course overlaps with an already enrolled course.';
          setError(msg);
          setShowErrorAlert(true);
          setFlashMessages(msgs => ([
            ...msgs,
            { type: 'error', content: msg, id: `error-${Date.now()}` }
          ]));
          return;
        }
      }
    }
    
    setError(null);
    setShowErrorAlert(false);
    try {
      await enrollmentService.enrollInCourse(
        currentStudent.id.toString(),
        courseId
      );
      setFlashMessages(msgs => ([
        ...msgs,
        { type: 'success', content: 'Successfully enrolled in course!', id: `success-${Date.now()}` }
      ]));
      // After successful enroll: re-fetch enrolled and eligibility for UI update
      const resp = await studentService.getStudentCourses(currentStudent.id.toString());
      setEnrolledCourseIds(new Set(resp.courses.map((c: Course) => c.id)));
      const sumCreditsAfter = (resp.courses || []).reduce((sum: number, c: Course) => sum + (Number(c.credits) || 0), 0);
      setCurrentEnrolledCredits(sumCreditsAfter);
      
      // Refresh eligibility data
      const eligibilityResp = await studentService.getEligibleCourses(
        currentStudent.id.toString(),
        true,
        true
      );
      const eligibleSet = new Set<number>();
      const missingMap = new Map<number, string[]>();
      eligibilityResp.courses.forEach((course: any) => {
        if (course.eligible) {
          eligibleSet.add(course.id);
        }
        if (course.missing_prerequisites && course.missing_prerequisites.length > 0) {
          // Map missing prerequisites to course codes (strings)
          missingMap.set(course.id, course.missing_prerequisites.map((p: any) => p.code || p.name || String(p)));
        }
      });
      setEligibleCourseIds(eligibleSet);
      setMissingPrerequisites(missingMap);
      
      fetchCourses({ forceRefresh: true });
    } catch (err: any) {
      // Check for missing prerequisites in error object
      let errorMessage = err.message || 'Failed to enroll in course';
      if (err.missing && Array.isArray(err.missing)) {
        errorMessage = `Missing prerequisites: ${err.missing.join(', ')}`;
      }
      
      setError(errorMessage);
      setShowErrorAlert(true);
      setFlashMessages(msgs => ([
        ...msgs,
        { type: 'error', content: errorMessage, id: `error-${Date.now()}` }
      ]));
    }
  };

  // PAGE SIZE and PAGINATION with useCollection
  const {
    items: pageItems,
    paginationProps,
    collectionProps,
    actions,
  } = useCollection(visibleCourses, {
    pagination: { pageSize },
  });

  return (
    <SpaceBetween size="l">
      <Header variant="h1" description="Browse and search for available courses">Course Catalog</Header>
      <Flashbar
        items={flashMessages.map(msg => ({
          ...msg,
          dismissible: true,
          onDismiss: () => setFlashMessages(oldMsgs => oldMsgs.filter(m => m.id !== msg.id)),
        }))}
      />
      <SpaceBetween size="xxl">
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <div style={{ flexGrow: 1 }}>
            <Input
              value={searchQuery}
              onChange={({ detail }) => setSearchQuery(detail.value)}
              placeholder="Search courses by name, code, or instructor..."
              type="search"
            />
          </div>
          <Button onClick={handleSearch} variant="primary" loading={loading}>Search</Button>
        </div>

        {showErrorAlert && error && (
          <Alert type="error" dismissible onDismiss={() => setShowErrorAlert(false)}>{error}</Alert>
        )}
        {visibleCourses.length === 0 && !loading && (
          <Alert type="info">No courses available. The course catalog will be populated when the we reconnect.</Alert>
        )}
        <Cards
          {...collectionProps}
          stickyHeader={true}
          cardDefinition={{
            header: (item: Course) => {
              const isEnrolled = enrolledCourseIds.has(item.id);
              const isFull = item.capacity - item.enrolled <= 0;
              // Treat courses with no prerequisites as eligible by default
              const hasPrereqs = !!(item.prerequisites && item.prerequisites.length > 0);
              const isEligible = eligibleCourseIds.has(item.id) || !hasPrereqs;
              const missing = missingPrerequisites.get(item.id) || [];
              const wouldExceedCreditCap = (currentEnrolledCredits + (Number(item.credits) || 0)) > 21;
              // Precompute time conflict against currently enrolled courses on the client
              const targetParsed = item.schedule ? parseScheduleBasic(item.schedule) : null;
              const hasTimeConflict = targetParsed ? (Array.from(enrolledCourseIds).length > 0 && courses
                .filter(c => enrolledCourseIds.has(c.id))
                .some(ec => {
                  const p = ec.schedule ? parseScheduleBasic(ec.schedule) : null;
                  if (!p || !targetParsed) return false;
                  const sharesDay = p.days.some(d => targetParsed.days.includes(d));
                  if (!sharesDay) return false;
                  return timesOverlap(p.startMin, p.endMin, targetParsed.startMin, targetParsed.endMin);
                })) : false;

              const isDisabled = isEnrolled || isFull || !isEligible || wouldExceedCreditCap || hasTimeConflict;
              
              let buttonText = 'Enroll';
              if (isEnrolled) {
                buttonText = 'Enrolled';
              } else if (isFull) {
                buttonText = 'Full';
              } else if (wouldExceedCreditCap) {
                buttonText = 'Credit Limit';
              } else if (hasTimeConflict) {
                buttonText = 'Time Conflict';
              } else if (!isEligible && missing.length > 0) {
                buttonText = 'Prerequisites Required';
              } else if (!isEligible) {
                buttonText = 'Not Eligible';
              }
              
              return (
                <Header
                  variant="h2"
                  actions={
                    <Button
                      variant="primary"
                      disabled={isDisabled}
                      onClick={() => handleEnroll(String(item.id))}
                    >
                      {buttonText}
                    </Button>
                  }
                >
                  {item.code}: {item.name}
                </Header>
              );
            },
            sections: [
                {
                  id: 'code',
                  header: 'Code',
                  content: (item: Course) => item.code,
                },
                {
                  id: 'instructor',
                  header: 'Instructor',
                  content: (item: Course) => item.instructor,
                },
                {
                  id: 'daysOfWeek',
                  header: 'Days of Week',
                  content: (item: Course) => item.schedule.split(' ')[0],
                },
                {
                  id: 'time',
                  header: 'Time',
                  content: (item: Course) => item.schedule.split(' ')[1],
                },
              
                {
                  id: 'description',
                  header: 'Description',
                  content: (item: Course) => item.description,
                },
                {
                  id: 'meta',
                  header: 'Details',
                  content: (item: Course) => (
                    <SpaceBetween direction="horizontal" size="l">
                      <Box>
                        <SpaceBetween size="xs">
                          <Box variant="awsui-key-label">Credits</Box>
                          <Badge color="blue">{item.credits}</Badge>
                        </SpaceBetween>
                      </Box>
                      <Box>
                        <SpaceBetween size="xs">
                          <Box variant="awsui-key-label">Availability</Box>
                          <Badge color={item.capacity - item.enrolled <= 0 ? 'red' : 'green'}>
                            {Math.max(0, item.capacity - item.enrolled)} / {item.capacity} seats
                          </Badge>
                        </SpaceBetween>
                      </Box>
                    </SpaceBetween>
                  ),
                },
                {
                  id: 'prereqs',
                  header: 'Prerequisites',
                  content: (item: Course) => {
                    const missing = missingPrerequisites.get(item.id) || [];
                    const isEligibleForCourse = eligibleCourseIds.has(item.id);
                    const hasPrereqs = Array.isArray(item.prerequisites) && item.prerequisites.length > 0;
                    
                    return (
                      <SpaceBetween direction="vertical" size="xs">
                        {hasPrereqs ? (
                          <SpaceBetween direction="horizontal" size="xs">
                            {(item.prerequisites as string[]).map(pr => {
                              const isMissing = missing.includes(pr);
                              return (
                                <Badge key={pr} color={isMissing ? 'red' : 'green'}>
                                  {pr}
                                </Badge>
                              );
                            })}
                          </SpaceBetween>
                        ) : (
                          <span>None</span>
                        )}
                        {!isEligibleForCourse && hasPrereqs && missing.length > 0 && (
                          <Alert type="warning" dismissible={false}>
                            Missing prerequisites: {missing.join(', ')}
                          </Alert>
                        )}
                      </SpaceBetween>
                    );
                  },
                },
              ],
            }}
            cardsPerRow={[{ cards: 1 }, { minWidth: 600, cards: 2 }]}
            items={pageItems}
            variant='full-page'
            loading={loading}
            loadingText="Loading courses"
            empty={<Alert type="info">No courses available. The course catalog will be populated when the we reconnect.</Alert>}
            header={
              <Header
                actions={
                    <Button onClick={() => fetchCourses({ forceRefresh: true })} loading={loading}>
                      Refresh
                    </Button>
                }
              >

              </Header>
            }
            pagination={<Pagination {...paginationProps}
                onChange={(e) => {
                  paginationProps.onChange?.(e);
                  sessionStorage.setItem('courseList.page', String(e.detail.currentPageIndex));
                }}/>
          }
            preferences={<CollectionPreferences
            title="Preferences"
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            preferences={{ pageSize }}
            pageSizePreference={{
              title: 'Page size',
              options: [
                { value: 5, label: '5' },
                { value: 10, label: '10' },
                { value: 20, label: '20' },
                { value: 50, label: '50' },
              ],
            }}
            onConfirm={({ detail }) => {
              const size = Number((detail as any)?.preferences?.pageSize) || 10;
              setPageSize(size);
              sessionStorage.setItem('courseList.pageSize', String(size));
              actions.setCurrentPage(1);
              sessionStorage.setItem('courseList.page', '1');
            }}
          />}
        />
      </SpaceBetween>
    </SpaceBetween>
  );
};

export default CourseCatalog;
