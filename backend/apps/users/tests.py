from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class ProfileAndTokenTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='me@example.com',
            password='testpass123',
            username='meuser',
            full_name='Test Player',
        )

    def test_login_and_me_and_refresh(self):
        login = self.client.post(
            '/api/users/login/',
            {'email': 'me@example.com', 'password': 'testpass123'},
            format='json',
        )
        self.assertEqual(login.status_code, 200)
        access = login.json()['tokens']['access']
        refresh = login.json()['tokens']['refresh']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        me = self.client.get('/api/users/me/')
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.json()['email'], 'me@example.com')

        refreshed = self.client.post(
            '/api/users/token/refresh/',
            {'refresh': refresh},
            format='json',
        )
        self.assertEqual(refreshed.status_code, 200)
        self.assertIn('access', refreshed.json())

    def test_schema_includes_expected_tags(self):
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')
        response = self.client.get('/api/schema/', HTTP_ACCEPT='application/json')
        self.assertEqual(response.status_code, 200)
        schema = response.json()
        tag_names = [tag['name'] for tag in schema.get('tags', [])]
        for name in ('auth', 'users', 'progression', 'protocol', 'grades', 'notifications'):
            self.assertIn(name, tag_names)
        self.assertIn('bearerAuth', schema.get('components', {}).get('securitySchemes', {}))
