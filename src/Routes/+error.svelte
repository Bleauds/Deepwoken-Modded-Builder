<script>
    import { page } from '$app/stores';

    // Get error code and message
    $: errorCode = $page.error?.code || 'UNKNOWN_ERROR';
    $: errorMessage = $page.error?.message || 'Something went wrong!';

    // Define specific messages for different error codes
    $: errorDescription = {
        'USER_NOT_FOUND': 'This user profile could not be found.',
        'PROFILE_LOAD_ERROR': 'There was an error loading this profile.',
        'UNKNOWN_ERROR': 'Something went wrong!'
    }[errorCode];
</script>

<style>
    h1 {
        text-align: center;
    }
    .container {
        background-color: rgb(235, 240, 215);
        margin: 50px;
        border: 1px solid transparent;
        border-image: url(/border.png) 45%;
        border-image-width: 15px;
        border-image-outset: 2px;
        font-family: 'Lora', 'sans-serif';
        max-width: 500px;
        padding: 15px;
        color: black;
    }
    .error-details {
        margin: 15px 0;
    }
    .error-code {
        font-family: monospace;
        background: rgba(0, 0, 0, 0.05);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.9em;
    }
    .contact-info {
        margin-top: 20px;
    }
    .contact-links {
        margin-top: 10px;
    }
    .contact-links a {
        color: #0066cc;
        text-decoration: none;
    }
    .contact-links a:hover {
        text-decoration: underline;
    }
</style>

<div class="container">
    <h1>{$page.status}: {errorMessage}</h1>
    
    <div class="error-details">
        <p>{errorDescription}</p>
        <p>Error Code: <span class="error-code">{errorCode}</span></p>
    </div>

    <div class="troubleshooting">
        Chances are the database is currently restarting, so please wait 15 seconds and reload.
    </div>

    <div class="contact-info">
        If this page appears again, please contact us through either:
        <div class="contact-links">
            • <b>Discord DM:</b> @cyfiee<br/>
            • <a target="_blank" rel="noreferrer" href="https://discord.gg/B3BwytYWVK">Discord Server</a>
        </div>
    </div>
</div>