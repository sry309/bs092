# -*- coding: utf-8 -*-

from flask import Flask, send_from_directory, redirect
import req_handlers
import config
import os

app = Flask(__name__)
app.add_url_rule('/mining/<int:uid>/<token>/<proj>/<rsrc>/', view_func=req_handlers.mining, methods=['POST'])
app.add_url_rule('/history/<int:uid>/', view_func=req_handlers.getHistory)
app.add_url_rule('/result/<int:id>/', view_func=req_handlers.getResultById)
app.add_url_rule('/message/<int:uid>/', view_func=req_handlers.getMessageUnread)
app.add_url_rule('/message/<int:uid>/all/', view_func=req_handlers.getMessageAll)
app.add_url_rule('/message/<int:uid>/mark/<int:id>/', view_func=req_handlers.markMessage)
app.add_url_rule('/message/<int:uid>/mark/all/', view_func=req_handlers.markMessageAll)
app.add_url_rule('/notify/<int:uid>/', view_func=req_handlers.notify)
app.debug = True

@app.route('/<path:path>')
def staticHtml(path):
    return send_from_directory(config.staticPath, path)

@app.route('/js/<path:path>')
def staticJs(path):
    return send_from_directory(os.path.join(config.staticPath, 'js'), path)

@app.route('/css/<path:path>')
def staticCss(path):
    return send_from_directory(os.path.join(config.staticPath, 'css'), path)

@app.route('/')
def redirIndex():
    return redirect('/index.html')

if __name__ == '__main__':
    app.run()