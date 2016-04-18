# -*- coding: utf-8 -*-

from flask import Flask, send_from_directory, redirect
import req_handlers
import config
import os

app = Flask(__name__)
app.add_url_rule('/mining/<user>/<proj>/<rsrc>/', view_func=req_handlers.mining, methods=['POST'])
app.add_url_rule('/result/', view_func=req_handlers.getResult)
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