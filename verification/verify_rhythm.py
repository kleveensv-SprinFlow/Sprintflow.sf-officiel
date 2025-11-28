from playwright.sync_api import sync_playwright

def verify_rhythm_bar():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # IMPORTANT: Set local storage to mock auth or bypass login if possible
        # However, the app likely uses Supabase auth which is hard to mock via local storage alone 
        # without a valid session.
        # But we can try to intercept the session check or manually set a state if we knew the keys.
        
        # Alternative: We can mock the network response for 'useTrainingPhases' and 'useAuth'
        # if we could, but Playwright intercepts network, not React hooks.
        
        # STRATEGY: 
        # 1. Navigate to the app.
        # 2. Wait for login or redirect.
        # 3. If stuck on login, we might be blocked.
        # 4. If we can reach the dashboard, we check for RhythmBar.
        
        # Attempt to login using the test credentials provided in memory
        page.goto("http://localhost:5173/login")
        
        try:
            # Fill login form
            page.get_by_placeholder("Votre email").fill("test.coach@sprintflow.run")
            page.get_by_placeholder("Votre mot de passe").fill("password123")
            page.get_by_role("button", name="Se connecter").click()
            
            # Wait for dashboard
            page.wait_for_url("**/dashboard", timeout=10000)
            print("Logged in successfully")
            
            # Navigate to Planning (assuming there is a nav link)
            # Usually bottom tab or side menu.
            # Memory says "ManagePlanningPage.tsx implements... shortcuts... CoachPlanning.tsx"
            # Let's try to go directly to /planning or click navigation
            
            # Try clicking on "Planning" in navigation if visible
            # Or assume we land on dashboard and need to switch view.
            # App.tsx suggests navigation via state or tabs.
            
            # Let's wait a bit for load
            page.wait_for_timeout(3000)
            
            # Take screenshot of dashboard to see where we are
            page.screenshot(path="verification/dashboard.png")
            
            # If we are in dashboard, we need to go to Planning.
            # Look for a "Planning" button or icon.
            # The TabBar likely has it.
            # page.get_by_text("Planning").click() # Try generic text
            
            # If unable to navigate easily, we might force the URL if routing is enabled
            page.goto("http://localhost:5173/planning") # Try direct URL
            page.wait_for_timeout(3000)
            
            # Now we look for the Rhythm Bar
            # It should be above the Week Navigator
            
            # We can try to add a phase to verify the modal
            # Find a "plus" icon in the rhythm bar or a week block
            # Since we have no phases initially, all weeks are empty.
            
            # Snapshot the planning view
            page.screenshot(path="verification/planning_view.png")
            
            print("Planning view screenshot taken")
            
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        
        finally:
            browser.close()

if __name__ == "__main__":
    verify_rhythm_bar()
