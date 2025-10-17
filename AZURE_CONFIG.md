# Azure Configuration for COSTAATT Document Upload System

## Microsoft Graph API Configuration

Add these environment variables to your `.env` file:

```env
# Microsoft Graph Configuration (Azure App Registration)
GRAPH_TENANT_ID=your_tenant_id_here
GRAPH_CLIENT_ID=your_client_id_here
GRAPH_CLIENT_SECRET=your_client_secret_here
GRAPH_SENDER_UPN=your_sender_email@domain.com
```

## Azure App Registration Details

To set up Azure App Registration for email functionality:

1. **Go to Azure Portal** → Azure Active Directory → App registrations
2. **Create a new registration** with the name "COSTAATT Document Upload System"
3. **Note down the following values:**
   - Application (client) ID
   - Directory (tenant) ID
4. **Create a client secret** and note the secret value
5. **Configure the sender email** address for sending notifications

## Required API Permissions

Ensure the following Microsoft Graph API permissions are granted:

1. **Mail.Send** - Send emails on behalf of users
2. **User.Read** - Read user profiles (for sending emails)

## Testing Email Functionality

After configuring the environment variables, test the email functionality by:

1. Running a test submission
2. Checking the Laravel logs for email sending status
3. Verifying emails are received at the configured addresses

## Security Notes

- Keep the client secret secure and never commit it to version control
- Rotate the client secret periodically
- Monitor API usage in Azure portal
- Use least privilege principle for API permissions
