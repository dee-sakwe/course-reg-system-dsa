import { useState, useEffect } from 'react';
import {
  Header,
  SpaceBetween,
  Alert,
  Box,
  Flashbar,
  Modal,
  Button,
} from '@cloudscape-design/components';
import CourseCard from '../components/CourseCard';
import { Course, Enrollment } from '../types';
import { studentService, enrollmentService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Schedule = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashMessages, setFlashMessages] = useState<any[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDrop, setPendingDrop] = useState<{ enrollmentId: string; course?: Course } | null>(null);
  const { currentStudent } = useAuth();

  // Create a map from course_id to enrollment_id for quick lookup
  const courseToEnrollmentMap = new Map<number, number>();
  enrollments.forEach(enrollment => {
    courseToEnrollmentMap.set(enrollment.course_id, enrollment.id);
  });

  useEffect(() => {
    if (currentStudent) {
      fetchEnrolledCourses();
    }
  }, [currentStudent]);

  const fetchEnrolledCourses = async () => {
    if (!currentStudent) return;

    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getStudentCourses(currentStudent.id.toString());
      setEnrolledCourses(data.courses);
      setEnrollments(data.enrollments || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load enrolled courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDropCourse = async (enrollmentId: string) => {
    if (!currentStudent) return;

    setError(null);
    try {
      await enrollmentService.dropCourse(enrollmentId);
      setFlashMessages(msgs => ([
        ...msgs,
        { type: 'success', content: 'Successfully dropped course!', id: `success-${Date.now()}` }
      ]));
      // Refresh the enrolled courses list
      await fetchEnrolledCourses();
    } catch (err: any) {
      setError(err.message || 'Failed to drop course');
      setFlashMessages(msgs => ([
        ...msgs,
        { type: 'error', content: err.message || 'Failed to drop course', id: `error-${Date.now()}` }
      ]));
    }
  };

  const openConfirmDrop = (enrollmentId: string, course: Course) => {
    setPendingDrop({ enrollmentId, course });
    setConfirmOpen(true);
  };

  const confirmDrop = async () => {
    if (!pendingDrop) return;
    setConfirmOpen(false);
    await handleDropCourse(pendingDrop.enrollmentId);
    setPendingDrop(null);
  };

  const cancelDrop = () => {
    setConfirmOpen(false);
    setPendingDrop(null);
  };

  const totalCredits = enrolledCourses.reduce((sum, course) => sum + course.credits, 0);

  return (
    <SpaceBetween size="xxl">
      <Header
        variant="h1"
        description="View and manage your enrolled courses"
      >
        My Schedule
      </Header>
      <Modal
        visible={confirmOpen}
        onDismiss={cancelDrop}
        header="Confirm drop"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={cancelDrop}>Cancel</Button>
              <Button variant="primary" onClick={confirmDrop}>Drop course</Button>
            </SpaceBetween>
          </Box>
        }
      >
        {pendingDrop?.course ? (
          <Box>
            Are you sure you want to drop {pendingDrop.course.code}: {pendingDrop.course.name}?
          </Box>
        ) : (
          <Box>Are you sure you want to drop this course?</Box>
        )}
      </Modal>
      {flashMessages.length > 0 && (
        <Flashbar
          items={flashMessages.map(msg => ({
            ...msg,
            dismissible: true,
            onDismiss: () => setFlashMessages(oldMsgs => oldMsgs.filter(m => m.id !== msg.id)),
          }))}
        />
      )}
        <SpaceBetween size="m">
          <Box>
            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Total Credits</Box>
              <Box fontSize="heading-l" fontWeight="bold">
                {totalCredits}
              </Box>
            </SpaceBetween>
          </Box>

          {error && (
            <Alert type="error" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          {!loading && !error && enrolledCourses.length === 0 && (
            <Alert type="info">
              You are not enrolled in any courses yet. Visit the Course Catalog to browse and enroll.
            </Alert>
          )}

          <SpaceBetween size="m">
            {enrolledCourses.map((course) => {
              const enrollmentId = courseToEnrollmentMap.get(course.id);
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrolled
                  onDrop={(id) => openConfirmDrop(id, course)}
                  enrollmentId={enrollmentId}
                />
              );
            })}
          </SpaceBetween>
        </SpaceBetween>
    </SpaceBetween>
  );
};

export default Schedule;
