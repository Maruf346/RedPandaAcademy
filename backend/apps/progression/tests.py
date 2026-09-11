from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.progression.models import Assignment, UserCard, UserProgress

User = get_user_model()


class AuthenticatedAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='player@example.com',
            password='testpass123',
            username='player1',
        )
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')


class ProgressSnapshotTests(AuthenticatedAPITestCase):
    def test_get_empty_snapshot_matches_frontend_shape(self):
        response = self.client.get('/api/progression/snapshot/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['rank'], 0)
        self.assertEqual(data['customDone'], 0)
        self.assertEqual(data['cards'], {})
        self.assertEqual(data['drills'], {})
        self.assertEqual(data['assignments'], [])
        self.assertEqual(data['kpiStats'], {})
        self.assertEqual(data['scenStats'], {})
        self.assertEqual(data['proto']['phase'], 1)
        self.assertEqual(data['proto']['p1'], [])
        self.assertEqual(data['proto']['weekly'], [])
        self.assertIsNone(data['lastGrade'])

    def test_put_snapshot_round_trips_frontend_payload(self):
        payload = {
            'rank': 2,
            'best': {'0': 90, '1': 82},
            'cards': {'3': 2, '7': 1},
            'drills': {'1': 4},
            'assignments': [
                {
                    'name': 'Study & re-drill: isolation',
                    'why': 'Missed on the Apprentice exam',
                    'sets': 'Flashcards + reread the module',
                    'pass': 'Answer it cold, twice',
                    'done': False,
                },
                {
                    'name': 'Mirror drill',
                    'why': 'Assigned from graded call',
                    'sets': 2,
                    'pass': 'Zero talk in 4 seconds',
                    'done': True,
                },
            ],
            'kpiStats': {'16': {'pass': 1, 'partial': 2, 'fail': 3}},
            'scenStats': {'11': {'count': 4, 'fail': 1}},
            'customDone': 3,
            'proto': {
                'phase': 2,
                'p1': ['Thu Sep 11 2026'],
                'anchors': {'0': 5},
                'd12': {'1': True},
                'weekly': [{'d': 2, 't': 'Thu Sep 11 2026'}],
            },
        }
        response = self.client.put('/api/progression/snapshot/', payload, format='json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['rank'], 2)
        self.assertEqual(data['customDone'], 3)
        self.assertEqual(data['cards']['3'], 2)
        self.assertEqual(data['drills']['1'], 4)
        self.assertEqual(len(data['assignments']), 2)
        self.assertEqual(data['assignments'][0]['sets'], 'Flashcards + reread the module')
        self.assertEqual(data['assignments'][0]['pass'], 'Answer it cold, twice')
        self.assertEqual(data['assignments'][1]['sets'], '2')
        self.assertTrue(data['assignments'][1]['done'])
        self.assertEqual(data['kpiStats']['16']['fail'], 3)
        self.assertEqual(data['scenStats']['11']['count'], 4)
        self.assertEqual(data['proto']['phase'], 2)
        self.assertEqual(data['proto']['weekly'][0]['d'], 2)
        self.assertEqual(data['proto']['weekly'][0]['t'], 'Thu Sep 11 2026')

        self.assertEqual(UserProgress.objects.get(user=self.user).rank, 2)
        self.assertEqual(UserCard.objects.get(user=self.user, card_index=3).mastery, 2)
        self.assertEqual(Assignment.objects.filter(user=self.user).count(), 2)

        again = self.client.get('/api/progression/snapshot/')
        self.assertEqual(again.json()['rank'], 2)
        self.assertEqual(again.json()['proto']['anchors']['0'], 5)

    def test_patch_rank_does_not_wipe_cards(self):
        self.client.put(
            '/api/progression/snapshot/',
            {'rank': 1, 'cards': {'0': 2}},
            format='json',
        )
        response = self.client.patch(
            '/api/progression/snapshot/',
            {'rank': 2},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['rank'], 2)
        self.assertEqual(response.json()['cards']['0'], 2)


class AssignmentContractTests(AuthenticatedAPITestCase):
    def test_create_assignment_accepts_string_sets_and_pass_alias(self):
        response = self.client.post(
            '/api/progression/assignments/',
            {
                'name': 'Study isolation',
                'why': 'Missed on rank exam',
                'sets': 'Flashcards + reread the module',
                'pass': 'Answer it cold, twice',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['sets'], 'Flashcards + reread the module')
        self.assertEqual(response.json()['pass'], 'Answer it cold, twice')
        self.assertEqual(response.json()['pass_condition'], 'Answer it cold, twice')
