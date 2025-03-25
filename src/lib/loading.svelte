<style>
    #loading-screen {
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: white;
        font-family: 'Lora', 'sans-serif';
        letter-spacing: 5px;
        overflow: hidden;
    }
    #loading-icon {
        width: auto;
        height: auto;
        max-width: 100px;
        max-height: 100px;
        animation: rotation 1.5s infinite linear;
    }
    @keyframes rotation {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(359deg);
        }
    }
</style>
<div id="loading-screen">
    <div class="icon">
        <img id="loading-icon" src="/ouroboros.png" alt="loading icon">
        <p>Loading...</p>
    </div>
</div>