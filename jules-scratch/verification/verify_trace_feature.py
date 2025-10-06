from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Navigate to the transactions page
        page.goto("http://localhost:5173/#/transactions", timeout=60000)

        # 2. Find the first transaction hash link and get its href
        first_tx_link = page.locator('table > tbody > tr:first-child > td:first-child > a').first
        expect(first_tx_link).to_be_visible(timeout=30000)

        # 3. Extract the transaction hash from the link's href
        tx_href = first_tx_link.get_attribute("href")
        tx_hash = tx_href.split('/')[-1]

        # 4. Navigate to the transaction details page with the valid hash
        page.goto(f"http://localhost:5173/#/tx/{tx_hash}", timeout=60000)

        # 5. Wait for the main transaction details to load by checking for the hash visibility
        tx_hash_element = page.locator(f'p:has-text("{tx_hash}")')
        expect(tx_hash_element).to_be_visible(timeout=30000)

        # 6. Click the "View Trace" button
        view_trace_button = page.locator('button:has-text("View Trace")')
        expect(view_trace_button).to_be_visible(timeout=10000)
        view_trace_button.click()

        # 7. Wait for either the trace details or a specific error message to appear
        trace_details_locator = page.locator('h3:has-text("Transaction Trace")')
        error_message_locator = page.locator('div.text-red-500:has-text("Error fetching trace:")')

        # Use expect.any_of to wait for either locator to be visible
        expect(trace_details_locator.or_(error_message_locator)).to_be_visible(timeout=30000)

        # 8. Take the final screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

    except Exception as e:
        page.screenshot(path="jules-scratch/verification/error_screenshot.png")
        print(f"An error occurred: {e}")
        raise
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)