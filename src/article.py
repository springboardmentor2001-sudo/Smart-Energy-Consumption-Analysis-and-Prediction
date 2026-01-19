from flask import Flask, render_template_string, request

app = Flask(__name__)

@app.route("/post", methods=["GET", "POST"])
def post_article():

    if request.method == "POST":
        title = request.form["title"]
        author = request.form["author"]
        content = request.form["content"]

        return f"""
        <h2>Article Posted Successfully!</h2>
        <p><b>Title:</b> {title}</p>
        <p><b>Author:</b> {author}</p>
        <p>{content}</p>
        <a href="/post">Post Another</a>
        """

    return render_template_string("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Post Article</title>
        <style>
            body { font-family: Arial; background: #f4f6f9; }
            .box {
                width: 50%;
                margin: auto;
                background: white;
                padding: 20px;
                margin-top: 50px;
                border-radius: 8px;
            }
            input, textarea {
                width: 100%;
                padding: 10px;
                margin: 10px 0;
            }
            button {
                background: #2563eb;
                color: white;
                padding: 10px;
                border: none;
                cursor: pointer;
            }
        </style>
    </head>
    <body>

        <div class="box">
            <h2>📝 Post Your Article</h2>

            <form method="POST">
                <input type="text" name="title" placeholder="Article Title" required>
                <input type="text" name="author" placeholder="Author Name" required>
                <textarea name="content" rows="6" placeholder="Write your article..." required></textarea>
                <button type="submit">Publish</button>
            </form>
        </div>

    </body>
    </html>
    """)

if __name__ == "__main__":
    app.run(debug=True)
