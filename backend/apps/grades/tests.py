from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.grades.models import CallGrade, GradeKpiScore

User = get_user_model()


class CallGradeIngestTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='grader@example.com',
            password='testpass123',
            username='grader',
        )
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')

    def test_create_call_grade_builds_kpi_score_rows(self):
        response = self.client.post(
            '/api/grades/call-grades/',
            {
                'transcript': 'Test transcript',
                'summary': 'Died on isolation',
                'died': 'KPI 16 at Step 10 — asked before the mirror',
                'scorecard': [
                    {'n': 1, 'score': 'pass', 'note': 'ok'},
                    {'n': 16, 'score': 'fail', 'note': 'question before mirror'},
                ],
                'failures': [{'kpi': 16, 'quote': 'so what do you think?', 'why': 'no mirror'}],
                'scenarioTags': [{'scenario': 11, 'handled': 'fail', 'note': 'discounted'}],
                'drills': [{'name': 'Mirror Discipline', 'sets': '10x2', 'pass': 'silence'}],
                'overall_pass': False,
            },
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(len(data['kpi_scores']), 2)
        self.assertEqual(data['scenario_tags'][0]['scenario'], 11)
        self.assertEqual(data['assigned_drills'][0]['name'], 'Mirror Discipline')
        grade = CallGrade.objects.get(id=data['id'])
        self.assertEqual(GradeKpiScore.objects.filter(call_grade=grade).count(), 2)
        self.assertEqual(
            GradeKpiScore.objects.get(call_grade=grade, kpi_number=16).score,
            'fail',
        )

        snapshot = self.client.get('/api/progression/snapshot/')
        self.assertEqual(snapshot.json()['lastGrade']['died'], grade.died)

    def test_quiz_attempt_create(self):
        response = self.client.post(
            '/api/grades/quiz-attempts/',
            {
                'quiz_name': 'Apprentice Exam',
                'quiz_index': 0,
                'total_questions': 10,
                'correct_count': 8,
                'score_percent': 80,
                'passed': True,
                'missed_topics': [],
            },
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.json()['passed'])
