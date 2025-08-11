    function openSignIn() {
        document.getElementById('signInModal').style.display='block'
    }
    function closeSignIn() {
        document.getElementById('signInModal').style.display='none'
    }
    function openSignUp() {
        document.getElementById('signUpModal').style.display='block'
    }
    function closeSignUp() {
        document.getElementById('signUpModal').style.display='none'
    }
    document.getElementById('signin').addEventListener('click', openSignIn);
    document.getElementById('signup').addEventListener('click', openSignUp)
