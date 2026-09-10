#!/usr/bin/env python
"""Test script for Red Panda Academy Backend API."""
import os
import sys
import requests
import json

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

BASE_URL = "http://127.0.0.1:8000/api"

def main():
    print("=" * 60)
    print("Red Panda Academy Backend API Tests")
    print("=" * 60)
    
    # Get auth token
    User = get_user_model()
    try:
        u = User.objects.get(email='admin@redpandaacademy.local')
    except User.DoesNotExist:
        print("Creating admin user...")
        u = User.objects.create_superuser('admin@redpandaacademy.local', 'admin123')
    
    refresh = RefreshToken.for_user(u)
    token = str(refresh.access_token)
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    print("\n1. Health Check")
    r = requests.get(f'{BASE_URL}/health/')
    print(f"  GET /api/health/ -> {r.status_code}")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    assert r.json() == {"status": "ok"}
    print("  [OK] Health check passed")
    
    print("\n2. Progression API")
    
    # Get progress
    r = requests.get(f'{BASE_URL}/progression/progress/', headers=headers)
    print(f"  GET /api/progression/progress/ -> {r.status_code}")
    assert r.status_code == 200
    data = r.json()
    print(f"    rank={data['rank']}, customDone={data['custom_done']}")
    
    # Update progress
    r = requests.patch(f'{BASE_URL}/progression/progress/', 
                       headers=headers, 
                       data=json.dumps({'rank': 2, 'best': {0: 85, 1: 90}, 'custom_done': 5}))
    print(f"  PATCH /api/progression/progress/ -> {r.status_code}")
    assert r.status_code == 200
    data = r.json()
    assert data['rank'] == 2
    print(f"    Updated: rank={data['rank']}, best={data['best']}")
    
    # Create assignment
    r = requests.post(f'{BASE_URL}/progression/assignments/',
                      headers=headers, 
                      data=json.dumps({'name': 'Test Assignment', 'why': 'Testing', 'sets': 2, 'pass_condition': 'Pass', 'done': False}))
    print(f"  POST /api/progression/assignments/ -> {r.status_code}")
    assert r.status_code == 201
    assignment_id = r.json()['id']
    print(f"    Created: id={assignment_id}")
    
    # Get assignments
    r = requests.get(f'{BASE_URL}/progression/assignments/', headers=headers)
    print(f"  GET /api/progression/assignments/ -> {r.status_code}")
    assert r.status_code == 200
    data = r.json()
    print(f"    Count: {data['count']}")
    
    # Toggle assignment
    r = requests.post(f'{BASE_URL}/progression/assignments/{assignment_id}/toggle/', headers=headers)
    print(f"  POST /api/progression/assignments/{assignment_id[:8]}.../toggle -> {r.status_code}")
    assert r.status_code == 200
    data = r.json()
    assert data['done'] == True
    print(f"    Toggled: done={data['done']}")
    
    print("\n3. Protocol API")
    
    # Get protocol
    r = requests.get(f'{BASE_URL}/protocol/protocol/', headers=headers)
    print(f"  GET /api/protocol/protocol/ -> {r.status_code}")
    assert r.status_code == 200
    data = r.json()
    print(f"    phase={data['phase']}, p1_dates={data['p1_dates']}")
    
    # Log recall
    r = requests.post(f'{BASE_URL}/protocol/protocol/log-recall/',
                      headers=headers, 
                      data=json.dumps({'date': 'Thu Sep 11 2026'}))
    print(f"  POST /api/protocol/protocol/log-recall/ -> {r.status_code}")
    assert r.status_code == 200
    data = r.json()
    assert 'Thu Sep 11 2026' in data['p1_dates']
    print(f"    P1 dates: {data['p1_dates']}")
    
    # Increment anchor
    r = requests.post(f'{BASE_URL}/protocol/protocol/inc-anchor/',
                      headers=headers, 
                      data=json.dumps({'anchor_index': 0}))
    print(f"  POST /api/protocol/protocol/inc-anchor/ -> {r.status_code}")
    assert r.status_code == 200
    data = r.json()
    assert data['anchor_reps']['0'] == 1
    print(f"    Anchor reps: {data['anchor_reps']}")
    
    # Advance phase
    r = requests.post(f'{BASE_URL}/protocol/protocol/advance-phase/',
                      headers=headers, 
                      data=json.dumps({}))
    print(f"  POST /api/protocol/protocol/advance-phase/ -> {r.status_code}")
    assert r.status_code == 200
    data = r.json()
    print(f"    Phase: {data['phase']}")
    
    print("\n4. Grades API")
    
    # Create quiz attempt
    r = requests.post(f'{BASE_URL}/grades/quiz-attempts/',
                      headers=headers, 
                      data=json.dumps({
                          'quiz_name': 'Apprentice Exam', 
                          'quiz_index': 0, 
                          'total_questions': 10, 
                          'correct_count': 8, 
                          'score_percent': 80, 
                          'passed': True, 
                          'missed_topics': []
                      }))
    print(f"  POST /api/grades/quiz-attempts/ -> {r.status_code}")
    assert r.status_code == 201
    data = r.json()
    print(f"    Created: {data['quiz_name']} - {data['score_percent']}%")
    
    # Get quiz attempts
    r = requests.get(f'{BASE_URL}/grades/quiz-attempts/', headers=headers)
    print(f"  GET /api/grades/quiz-attempts/ -> {r.status_code}")
    assert r.status_code == 200
    data = r.json()
    print(f"    Count: {data['count']}")
    
    # Create call grade
    r = requests.post(f'{BASE_URL}/grades/call-grades/',
                      headers=headers, 
                      data=json.dumps({
                          'transcript': 'Test transcript',
                          'summary': 'Test grade',
                          'died': '',
                          'scorecard': [{'n': 1, 'score': 'pass', 'note': 'OK'}],
                          'failures': [],
                          'scenario_tags': [],
                          'assigned_drills': [],
                          'overall_pass': True
                      }))
    print(f"  POST /api/grades/call-grades/ -> {r.status_code}")
    assert r.status_code == 201
    data = r.json()
    print(f"    Created: overall_pass={data['overall_pass']}")
    
    # Get call grades
    r = requests.get(f'{BASE_URL}/grades/call-grades/', headers=headers)
    print(f"  GET /api/grades/call-grades/ -> {r.status_code}")
    assert r.status_code == 200
    data = r.json()
    print(f"    Count: {data['count']}")
    
    print("\n" + "=" * 60)
    print("[OK] All tests passed!")
    print("=" * 60)

if __name__ == '__main__':
    try:
        main()
    except AssertionError as e:
        print(f"\n[FAIL] Assertion failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[FAIL] Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)