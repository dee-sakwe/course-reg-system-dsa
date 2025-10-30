import json
import os
from typing import Dict

# Import the Flask app and models
from app import EnrollmentSystem
from models import db, Course

DATA_FILE = os.path.join(os.path.dirname(__file__), 'CS_Curriculum_JSON.json')


def load_json(path: str):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def seed_courses(drop_existing: bool = False):
    data = load_json(DATA_FILE)

    with EnrollmentSystem.app_context():
        if drop_existing:
            print('Dropping existing courses table data...')
            # WARNING: destructive — delete only courses and the association rows
            db.session.execute('DELETE FROM course_prerequisites')
            db.session.execute('DELETE FROM enrollments')
            db.session.execute('DELETE FROM courses')
            db.session.commit()

        # Phase 1: create Course rows without prerequisites and remember mapping from source id -> Course instance
        srcid_to_course: Dict[int, Course] = {}
        new_count = 0
        for item in data:
            src_id = item.get('id')
            code = item.get('code')
            name = item.get('name') or ''
            instructor = item.get('instructor') or ''
            description = item.get('description') or ''
            credits = item.get('credits')
            schedule = item.get('schedule') or ''

            # Avoid inserting duplicate course codes (best-effort)
            existing = None
            if code and code != 'nan':
                existing = Course.query.filter_by(course_code=code).first()

            if existing:
                print(f"Skipping existing course (code={code}) -> using id={existing.id}")
                srcid_to_course[src_id] = existing
                continue

            c = Course(
                course_name=name,
                course_code=code if code != 'nan' else '',
                instructor=instructor,
                max_students=item.get('capacity', 30) or 30,
                description=description,
                course_credits=int(credits) if isinstance(credits, (int, float)) else (None if credits is None else 0),
                schedule=schedule,
            )
            db.session.add(c)
            # flush to get an id assigned so we can map prerequisites reliably in the same transaction
            db.session.flush()
            srcid_to_course[src_id] = c
            new_count += 1

        db.session.commit()
        print(f'Inserted/updated {new_count} courses (phase 1)')

        # Phase 2: attach prerequisites
        updated = 0
        for item in data:
            src_id = item.get('id')
            prereq_ids = item.get('prerequisites') or []
            if not prereq_ids:
                continue
            course = srcid_to_course.get(src_id) or Course.query.filter_by(course_code=item.get('code')).first()
            if not course:
                continue
            resolved = []
            for pid in prereq_ids:
                target = srcid_to_course.get(pid)
                if not target:
                    # try to resolve by id in DB
                    try:
                        target = Course.query.get(int(pid))
                    except Exception:
                        target = None
                if target:
                    resolved.append(target)
            if resolved:
                course.prerequisites = resolved
                db.session.add(course)
                updated += 1

        db.session.commit()
        print(f'Attached prerequisites for {updated} courses (phase 2)')


if __name__ == '__main__':
    import argparse

    p = argparse.ArgumentParser(description='Seed courses from JSON file')
    p.add_argument('--drop', action='store_true', help='Drop existing courses and related data first (destructive)')
    args = p.parse_args()

    seed_courses(drop_existing=args.drop)
    print('Seeding complete.')
