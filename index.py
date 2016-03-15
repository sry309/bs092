# -*- coding: utf-8 -*-

from flask import Flask
import req_handlers

app = Flask(__name__)
app.add_url_rule('/', view_func=req_handlers.index)
app.add_url_rule('/mining/<user>/<proj>/<rsrc>/', view_func=req_handlers.mining, methods=['POST'])
app.add_url_rule('/Entity/<user>/datasets/iris/', view_func=req_handlers.iris)
app.debug = True

if __name__ == '__main__':
    app.run()