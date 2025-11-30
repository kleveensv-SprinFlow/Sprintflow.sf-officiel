from playwright.sync_api import sync_playwright

def verify_exercise_library():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use slightly larger viewport for better view
        page = browser.new_page(viewport={'width': 414, 'height': 896})

        try:
            # Login and navigate to dashboard
            page.goto("http://localhost:5173")

            # Wait for loading screen to pass or auth
            page.wait_for_timeout(5000)

            # Since I can't easily login with auth, I will try to intercept the render of the ExerciseLibrary component directly if possible,
            # or rely on the fact that I might be logged in if cookies persist (unlikely).
            # The app redirects to auth if not logged in.

            # Check if we are on auth page
            if page.get_by_text("Se connecter").is_visible():
                print("Logging in...")
                page.get_by_placeholder("Email").fill("test.coach@sprintflow.run")
                page.get_by_placeholder("Mot de passe").fill("password123")
                page.get_by_text("Se connecter").click()
                page.wait_for_timeout(5000)

            # Now on dashboard. Navigate to Hub.
            # Click on 'Hub' tab
            page.get_by_text("Hub").click()
            page.wait_for_timeout(1000)

            # Scroll to find 'Bibliothèque d'exercices' if necessary, or drag the carousel
            # Since it's a drag carousel, we might need to drag.
            # However, CoachHubView renders all cards in a horizontal list but overflow hidden.
            # Let's try to drag.

            # Locate the carousel container
            # It's hard to target drag specifically without correct selectors.
            # But wait, I added 'exercise-library' as the LAST item in coachActions.
            # The carousel starts at index 0. I need to swipe.

            # Simulating swipe
            # Center of screen
            center_x = 414 / 2
            center_y = 896 / 2

            # Swipe left 2 times to reach the 3rd item (index 2)
            for _ in range(2):
                page.mouse.move(350, center_y)
                page.mouse.down()
                page.mouse.move(50, center_y, steps=10)
                page.mouse.up()
                page.wait_for_timeout(1000)

            # Click on the center card
            # The card is likely in the middle now.
            # Or I can try to click specifically on the text "Bibliothèque d'exercices" if visible
            try:
                page.get_by_text("Bibliothèque d'exercices").click()
            except:
                # If text is not visible, click center
                page.mouse.click(center_x, center_y)

            page.wait_for_timeout(2000)

            # Verify we are in the library
            page.screenshot(path="verification/library_view.png")
            print("Screenshot taken: verification/library_view.png")

            # Verify elements
            # Check for "Bibliothèque d'exercices" header
            # Check for category pills (e.g., "Tout")
            # Check for search bar

            # Try to click "Créer un autre exercice" or "Créer" to open form
            # But let's just screenshot the list first.

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_exercise_library()
