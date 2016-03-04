from flask import Flask
import req_handlers

app = Flask(__name__)
app.add_url_rule('/', view_func=req_handlers.index)
app.add_url_rule('/mining', view_func=req_handlers.mining, methods=['POST'])

if __name__ == '__main__':
    app.run()