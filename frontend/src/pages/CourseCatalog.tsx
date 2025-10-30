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
  const [flashMessages, setFlashMessages] = useState<any[]>([]);

  // Fetch user enrolled courses (only once for now, could fetch after enroll too)
  useEffect(() => {
    async function fetchEnrolledIds() {
      if (!currentStudent) return;
      try {
        const resp = await studentService.getStudentCourses(currentStudent.id.toString());
        setEnrolledCourseIds(new Set(resp.courses.map((c: Course) => c.id)));
      } catch {
        setEnrolledCourseIds(new Set());
      }
    }
    fetchEnrolledIds();
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
      // After successful enroll: re-fetch enrolled for UI update
      const resp = await studentService.getStudentCourses(currentStudent.id.toString());
      setEnrolledCourseIds(new Set(resp.courses.map((c: Course) => c.id)));
      fetchCourses({ forceRefresh: true });
    } catch (err: any) {
      setError(err.message || 'Failed to enroll in course');
      setShowErrorAlert(true);
      setFlashMessages(msgs => ([
        ...msgs,
        { type: 'error', content: err.message || 'Failed to enroll in course', id: `error-${Date.now()}` }
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
            header: (item: Course) => (
              <Header
                variant="h2"
                actions={
                  <Button
                    variant="primary"
                    disabled={item.capacity - item.enrolled <= 0 || enrolledCourseIds.has(item.id)}
                    onClick={() => handleEnroll(String(item.id))}
                  >
                    {enrolledCourseIds.has(item.id)
                      ? 'Enrolled'
                      : item.capacity - item.enrolled <= 0
                        ? 'Full'
                        : 'Enroll'}
                  </Button>
                }
              >
                {item.code}: {item.name}
              </Header>
            ),
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
                  content: (item: Course) => (
                    item.prerequisites && item.prerequisites.length > 0 ? (
                      <SpaceBetween direction="horizontal" size="xs">
                        {item.prerequisites.map(pr => (
                          <Badge key={pr}>{pr}</Badge>
                        ))}
                      </SpaceBetween>
                    ) : (
                      <span>None</span>
                    )
                  ),
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
