from playwright.sync_api import sync_playwright

def verify_exercise_library():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 414, 'height': 896})

        # Subscribe to console logs
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"BROWSER ERROR: {err}"))

        try:
            print("Navigating...")
            page.goto("http://localhost:5173")
            page.wait_for_timeout(5000)
            page.screenshot(path="verification/console_debug.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_exercise_library()
