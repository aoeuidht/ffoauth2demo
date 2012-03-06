#!/usr/bin/env python
# -*- coding=utf-8 -*-

CLIENT_ID = "f4eff0883f785303e8756bcc51899e56"
CLIENT_SECRET = "31017a79dbac38862a8dbc81abba240b"


AUTHORIZATION_URI = "http://fanfou.com/oauth2/authorize"
ACCESS_TOKEN_URI = "http://fanfou.com/oauth2.token"
API_SERVER = "http://api.fanfou.com"

try:
    import json
except ImportError:
    import simplejson as json


import logging
import os.path
import urllib
import urllib2

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template

class HomeHandler(webapp.RequestHandler):
    def get(self):
        tmp_file = os.path.join(os.path.dirname(__file__), "home.html")
        self.response.out.write(template.render(tmp_file, {}))

class AuthorizeHandler(webapp.RequestHandler):
    """get CODE from fanfou.com
    """

    def get(self):
        """
        
        Arguments:
        - `self`:
        """
        params = {'client_id': CLIENT_ID}
        params['redirect_uri'] = self.request.path_url
        code = self.request.get('code')
        tmp_file = os.path.join(os.path.dirname(__file__), "home.html")

        if code:
            #got code from server
            logging.info('Retrieve code form server success, code: %s' % code)
            #now we get the access/refresh token
            params['client_secret'] = CLIENT_SECRET
            params['code'] = code
            params['grant_type'] = 'authorization_code'
            logging.info('retrieve access token from %s using params: %s' % (ACCESS_TOKEN_URI,
                                                                             urllib.urlencode(params)))
            request = urllib2.Request(ACCESS_TOKEN_URI,
                                      urllib.urlencode(params))
            response = urllib2.urlopen(request)
            body = response.read()
            logging.info(body)
            access_results = json.loads(body)
            logging.info(access_results)
            access_results['client_id'] = CLIENT_ID
            access_results['redirect_uri'] = self.request.path_url
            access_results['client_secret'] = CLIENT_SECRET
            access_results['api_server'] = API_SERVER
            access_results['access_token_uri'] = ACCESS_TOKEN_URI
            self.response.out.write(template.render(tmp_file, access_results))
        else:
            #retrieve code from server
            params['response_type'] = 'code'
            self.redirect('%s?%s' % (AUTHORIZATION_URI,
                                     urllib.urlencode(params)))
        
class CDHandler(webapp.RequestHandler):
    """cross domain handler
    """
    
    def get(self):
        """get handler
        
        Arguments:
        - `self`:
        """
        url = self.request.get('url')
        if not url:
            self.response.out.write('{error: "please add url in get param"}')

        try:
            request = urllib2.Request(url=url)
            response = urllib2.urlopen(request)
            self.response.out.write(response.read())
        except Exception, e:
            self.response.out.write('{error: "%s"}' % str(e))

    def post(self):
        """post handler
        
        Arguments:
        - `self`:
        """
        url = self.request.get('url')
        params = {}
        for k in self.request.arguments():
            if k == 'url':
                continue
            params[k] = self.request.get(k, '')
        logging.info(params)
        try:
            request = urllib2.Request(url,
                                      urllib.urlencode(params))
            response = urllib2.urlopen(request)
            body = response.read()
            logging.info(body)
            self.response.out.write(body)
        except Exception, e:
            self.response.out.write('{error: "%s"}' % str(e))
        
def main():
    util.run_wsgi_app(webapp.WSGIApplication([(r"/", HomeHandler),
                                              (r"/oauth2/authorize", AuthorizeHandler),
                                              (r"/cd", CDHandler),
                                              ]))


if __name__ == "__main__":
    main()
