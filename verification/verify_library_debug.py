from playwright.sync_api import sync_playwright

def verify_exercise_library():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 414, 'height': 896})

        try:
            print("Navigating...")
            page.goto("http://localhost:5173")
            page.wait_for_timeout(3000)
            page.screenshot(path="verification/step1_load.png")

            # Check for login
            if page.get_by_placeholder("Email").is_visible():
                print("Login form found.")
                page.get_by_placeholder("Email").fill("test.coach@sprintflow.run")
                page.get_by_placeholder("Mot de passe").fill("password123")
                page.get_by_text("Se connecter").click()
                print("Clicked login.")

                # Wait for navigation
                try:
                    page.wait_for_selector("text=Hub", timeout=15000)
                    print("Dashboard loaded.")
                except:
                    print("Dashboard not loaded in time.")
                    page.screenshot(path="verification/step2_login_fail.png")
            else:
                print("Login form not found. Might be already logged in or loading.")

            page.screenshot(path="verification/step3_dashboard.png")

            if page.get_by_text("Hub").is_visible():
                page.get_by_text("Hub").click()
                print("Clicked Hub.")
                page.wait_for_timeout(2000)
                page.screenshot(path="verification/step4_hub.png")

                # Try to swipe
                center_x = 414 / 2
                center_y = 896 / 2

                # Swipe left 2 times
                for i in range(2):
                    page.mouse.move(350, center_y)
                    page.mouse.down()
                    page.mouse.move(50, center_y, steps=10)
                    page.mouse.up()
                    page.wait_for_timeout(1000)
                    print(f"Swiped {i+1}")

                page.screenshot(path="verification/step5_swiped.png")

                # Click center
                page.mouse.click(center_x, center_y)
                page.wait_for_timeout(2000)
                page.screenshot(path="verification/step6_library.png")

                # Check for "Bibliothèque"
                if page.get_by_text("Bibliothèque").is_visible():
                    print("Library verified.")
                else:
                    print("Library text not found.")
            else:
                print("Hub tab not visible.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_exercise_library()
