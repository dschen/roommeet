"""
Django settings for roommeet project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""
from os import environ
# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

TEMPLATE_DIRS = (
    os.path.join(os.path.dirname(__file__), 'templates').replace('\\','/'),
)


STATICFILES_DIRS = (
    os.path.join(os.path.dirname(__file__), 'bootstrap').replace('\\','/'),
)

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'wl+an%sxug10(ude=vcg4y*$(2l_c+^6_q@64rhe7hpe5-fx(('

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'psycopg2',
    'people',
    'django.contrib.contenttypes',
    'django_facebook',
    
)

#FACEBOOK
FACEBOOK_APP_ID = 1396823877262310
FACEBOOK_APP_SECRET = 'b97eb1803919d59de8e6c6a99493fa9a'

#AUTH_USER_MODEL = 'django_facebook.FacebookProfileModel'
#AUTH_PROFILE_MODULE = 'django_cas.models.CustomProfile'

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_cas.middleware.CASMiddleware',
    'pagination.middleware.PaginationMiddleware',
)

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'django_cas.backends.CASBackend',
    'django_facebook.auth_backends.FacebookBackend',
)

CAS_SERVER_URL = 'https://fed.princeton.edu/cas/'

ROOT_URLCONF = 'roommeet.urls'

WSGI_APPLICATION = 'roommeet.wsgi.application'


TEMPLATE_CONTEXT_PROCESSORS = {
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.core.context_processors.tz',
    'django.core.context_processors.request',
    'django.contrib.messages.context_processors.messages',
    'django_facebook.context_processors.facebook',
}

# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

DATABASES = {
  'default': {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'NAME': 'd2tqtjb7qkq5gn',
    'HOST': 'ec2-54-204-42-178.compute-1.amazonaws.com',
    'PORT': 5432,
    'USER': 'vizgavggbfbwea',
    'PASSWORD': 'YcBmk5n0vLw5Y60ezCoqAlY5_B'
  }
}
# Honor the 'X-Forwarded-Proto' header for request.is_secure()
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = 'staticfiles'



