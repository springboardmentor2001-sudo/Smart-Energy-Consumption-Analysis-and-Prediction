from flask import Flask
from home_page import home_pg
from overview_page import overview_pg
from learning_page import learning_pg
from contact_page import contact_pg


def create_app():
    app = Flask(__name__)

    # Register all pages
    app.register_blueprint(home_pg)
    app.register_blueprint(overview_pg)
    app.register_blueprint(learning_pg)
    app.register_blueprint(contact_pg)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
