DeepSeek
__________________________

# **Bug Ticket: Logout Button Non-Functional in Safari**  

## **1. Title**  
**Logout Button Does Not Respond in Safari Browser**  

## **2. Description**  
The logout button fails to trigger any action when clicked in the Safari browser. This prevents users from ending their session, impacting both usability and security.  

## **3. Steps to Reproduce**  
1. Launch **Safari** (Version: [specify if known, e.g., 17.0]).  
2. Log in to the application.  
3. Attempt to log out by clicking the logout button (in header/dropdown).  
4. **Observed Result:** No response—no redirection, session remains active.  

## **4. Expected vs Actual Behavior**  
| **Expected** | **Actual** |  
|--------------|------------|  
| Logout button should end the session and redirect to login page or display confirmation. | Logout button is unresponsive; no action occurs. |  

## **5. Environment**  
- **Browser:** Safari (Version: [e.g., 17.0])  
- **OS:** macOS [e.g., Ventura 13.5]  
- **Device:** [e.g., MacBook Pro M1, iPadOS if applicable]  
- **App Version:** [e.g., v2.3.1]  

## **6. Severity & Impact**  
- **Priority:** High  
- **Impact:**  
  - Blocks core functionality (logout).  
  - Security risk if sessions persist unintentionally.  
  - Poor user experience on shared devices.  

---  
**Notes:**  
- Add attachments (screenshots/console logs) if available.  
- Check if issue persists in Safari Private Mode.  
