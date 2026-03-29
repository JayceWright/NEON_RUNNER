# Neon Runner 🏃‍♂️💨

An endless runner game built with HTML, Tailwind CSS, and Three.js! Dodge the gaps, jump over obstacles, and see how far you can run in this neon-infused cyber world! 🌆✨

## 🎮 How to Play

- **Start Game:** Press `Space` or `Enter`
- **Move Left/Right:** `A` / `D` or `Left Arrow` / `Right Arrow`
- **Jump:** `Space`, `W`, or `Up Arrow`
- **Pause/Resume:** `Escape` or `P`

Dodge the gaps in the platforms and don't fall off! The game speeds up the further you get. 🚀

## 📸 Screenshots

Here's a glimpse of the action:

| Start Screen | Gameplay | Jumping |
| --- | --- | --- |
| ![Start Screen](./screenshots/start-screen.png) | ![Gameplay](./screenshots/gameplay.png) | ![Jumping](./screenshots/jumping.png) |
| **Pause Screen** | **Game Over** | |
| ![Pause Screen](./screenshots/pause.png) | ![Game Over](./screenshots/game-over.png) | |

## 🚀 How to Run https://jaycewright.github.io/NEON_RUNNER/

## 🚀 How to Run Locally

You don't need any complex build steps to play the game locally. It's just a static HTML file!

However, because it loads 3D models (`.glb` files) via fetch, you'll need to run it through a local web server to avoid CORS (Cross-Origin Resource Sharing) issues with `file://` URLs.

Here are a few easy ways to run it:

### Option 1: Using `http-server` (Node.js)

If you have Node.js installed, you can use `http-server`:

1.  Open your terminal in the project directory.
2.  Install `http-server` globally (if you haven't already):
    ```bash
    npm install -g http-server
    ```
3.  Start the server:
    ```bash
    http-server
    ```
4.  Open your browser and navigate to the URL provided (usually `http://127.0.0.1:8080`).

### Option 2: Using Python

If you have Python installed, it comes with a built-in HTTP server:

1.  Open your terminal in the project directory.
2.  Run the following command:
    ```bash
    # For Python 3
    python3 -m http.server 8000

    # For Python 2
    python -m SimpleHTTPServer 8000
    ```
3.  Open your browser and navigate to `http://localhost:8000`.

### Option 3: VS Code Live Server

If you use Visual Studio Code, you can install the **Live Server** extension:

1.  Open the project folder in VS Code.
2.  Install the "Live Server" extension by Ritwick Dey.
3.  Right-click on `index.html` and select **"Open with Live Server"**.
4.  It will automatically open your default browser and load the game.

## 🛠️ Built With

*   [HTML5](https://developer.mozilla.org/en-US/docs/Web/HTML)
*   [Tailwind CSS](https://tailwindcss.com/) (via CDN)
*   [Three.js](https://threejs.org/) (r128)
*   [Meshoptimizer](https://meshoptimizer.org/) (for optimized 3D models)
*   Google Fonts (Sora)

Enjoy the neon vibes! 🕶️
