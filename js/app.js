$(document).ready(() => {
    // localStorage.removeItem('currentUser');  // For demo/testing - commented out to persist login state
    
    // Mobile menu toggle
    $('#hamburger-menu').click(function(e) {
        e.stopPropagation();
        $(this).toggleClass('active');
        $('#nav-menu').toggleClass('active');
    });

    // Handle all dropdowns (including auth dropdown)
    $('.dropdown > a').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $dropdown = $(this).parent();
        const $dropdownMenu = $(this).siblings('.dropdown-menu');
        
        // Close all other dropdowns
        $('.dropdown').not($dropdown).removeClass('active');
        $('.dropdown-menu').not($dropdownMenu).slideUp(300);
        
        // Toggle current dropdown
        $dropdown.toggleClass('active');
        $dropdownMenu.slideToggle(300);
    });

    // Close menus when clicking outside
    $(document).click(function(e) {
        if ($(e.target).closest('.dropdown').length === 0) {
            $('.dropdown').removeClass('active');
            $('.dropdown-menu').slideUp(300);
        }
        
        // Mobile nav close
        if (!$(e.target).closest('#nav-menu').length && !$(e.target).closest('#hamburger-menu').length) {
            $('#hamburger-menu').removeClass('active');
            $('#nav-menu').removeClass('active');
        }
        
        // Hide search results when clicking outside
        if (!$(e.target).closest('.search-container').length) {
            $('#search-results').hide();
        }
        
        // Close modal if clicking on modal background
        if ($(e.target).hasClass('modal')) {
            closeModal();
        }
    });

    // Carousels
    let navText = ["<i class='bx bx-chevron-left'></i>", "<i class='bx bx-chevron-right'></i>"];

    $('#hero-carousel').owlCarousel({
        items: 1,
        dots: false,
        loop: true,
        nav: true,
        navText: navText,
        autoplay: true,
        autoplayHoverPause: true
    });

    $('#top-movies-slide').owlCarousel({
        items: 2,
        dots: false,
        loop: true,
        autoplay: true,
        autoplayHoverPause: true,
        responsive: {
            500: { items: 3 },
            1280: { items: 4 },
            1600: { items: 6 }
        }
    });

    $('.movies-slide').owlCarousel({
        items: 2,
        dots: false,
        nav: true,
        navText: navText,
        margin: 15,
        responsive: {
            500: { items: 2 },
            1280: { items: 4 },
            1600: { items: 6 }
        }
    });

    // Auth System
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    function updateAuthUI() {
        if (currentUser) {
            $('.auth-text').text(currentUser.username || 'My Account');
            $('#login-btn, #register-btn').hide();
            $('#profile-btn, #logout-btn').show();
        } else {
            $('.auth-text').text('Sign in');
            $('#login-btn, #register-btn').show();
            $('#profile-btn, #logout-btn').hide();
        }
    }

    function showAuthModal(type) {
        console.log('showAuthModal called with type:', type);
        $('body').css('overflow', 'hidden');
        const $modal = $('#auth-modal');
        $modal.find('.modal-title').text(type);
        $modal.find('#auth-form').attr('data-type', type.toLowerCase());

        // Show or hide "Don't have an account? Register" link based on type
        if (type.toLowerCase() === 'register') {
            $modal.find('#switch-to-register').hide();
        } else {
            $modal.find('#switch-to-register').show();
        }

        $modal.fadeIn();
    }

    function closeModal() {
        $('body').css('overflow', 'auto');
        $('#auth-modal').fadeOut();
        $('.auth-dropdown').removeClass('active');
        $('.auth-dropdown .dropdown-menu').slideUp(300);
    }

    // Auth event listeners
    $('#login-btn, #register-btn').click(function(e) {
        e.preventDefault();
        const type = $(this).text().toLowerCase();
        console.log('Button clicked:', type);
        showAuthModal($(this).text());
        $('#auth-form').attr('data-type', type);
        console.log('Form data-type set to:', $('#auth-form').attr('data-type'));
    });

    // Handle click on continue button inside auth modal to submit form
    $('#auth-modal').on('click', '#continue-btn', function(e) {
        e.preventDefault();
        $('#auth-form').submit();
    });

    // Handle click on "Click here to login" link inside modal after registration
    $('#auth-modal').on('click', '#switch-to-login', function(e) {
        e.preventDefault();
        const $modal = $('#auth-modal');
        $modal.find('.modal-title').text('Sign in');
        $modal.find('#auth-form').show();
        $modal.find('#switch-to-login').remove();
        $modal.find('#auth-form').attr('data-type', 'login');
        // Clear form fields
        $('#auth-email').val('');
        $('#auth-password').val('');
    });

    $('.close-modal').click(closeModal);

    $('#switch-to-register').click(function(e) {
        e.preventDefault();
        showAuthModal('Register');
        // Explicitly set form data-type to register
        $('#auth-form').attr('data-type', 'register');
    });

    function getUsersFromStorage() {
        let users = JSON.parse(localStorage.getItem('users'));
        if (!Array.isArray(users)) {
            users = [];
        }
        return users;
    }

    $('#auth-form').submit(function(e) {
        e.preventDefault();
        const type = $(this).data('type');
        console.log('Form submit data-type attribute:', $('#auth-form').attr('data-type'));
        const email = $('#auth-email').val().trim();
        const password = $('#auth-password').val().trim();

        if (!email || !password) {
            alert('Please fill all fields');
            return;
        }

        // Simulate API call
        setTimeout(() => {
            if (type === 'register') {
                console.log('Register flow');
                // Get existing users from localStorage
                let users = getUsersFromStorage();

                // Check if email already registered
                if (users.some(user => user.email === email)) {
                    alert('Email already registered. Please login.');
                    // Keep modal in register mode, do not close or switch
                    return;
                }

                // Register new user
                const newUser = {
                    email,
                    password, // In real app, password should be hashed
                    username: email.split('@')[0],
                    joined: new Date().toISOString()
                };
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                currentUser = newUser;

                // Show thank you message and option to switch to login inside modal
                const $modal = $('#auth-modal');
                console.log('Registration successful: showing thank you message');
                $modal.find('.modal-title').text('Thank you for registering!');
                $modal.find('#auth-form').hide();
                // Try appending message and link directly inside modal
                $modal.find('.modal-body').empty();
                $modal.find('.modal-body').append('<p>Thank you for registering!</p>');
                if ($modal.find('#switch-to-login').length === 0) {
                    $modal.find('.modal-body').append('<p id="switch-to-login" style="cursor:pointer; color:blue; text-decoration:underline; margin-top:10px;">Click here to login</p>');
                }
            } else {
                console.log('Login flow');
                // Login flow
                let users = getUsersFromStorage();
                const user = users.find(user => user.email === email);

                if (!user) {
                    alert('No account found with this email. Please register first.');
                    return;
                }

                if (user.password !== password) {
                    alert('Incorrect password. Please try again.');
                    return;
                }

                localStorage.setItem('currentUser', JSON.stringify(user));
                currentUser = user;
                alert('Login successful!');
                closeModal();
            }
            updateAuthUI();
        }, 500);
    });

    $('#logout-btn').click(function(e) {
        e.preventDefault();
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateAuthUI();
    });

    $('.password-toggle').click(function(e) {
        e.stopPropagation();
        const $input = $('#auth-password');
        const $icon = $(this).find('i');
        if ($input.attr('type') === 'password') {
            $input.attr('type', 'text');
            $icon.removeClass('bx-hide').addClass('bx-show');
        } else {
            $input.attr('type', 'password');
            $icon.removeClass('bx-show').addClass('bx-hide');
        }
    });

    $('#auth-form').submit(function(e) {
        e.preventDefault();
        const type = $(this).data('type');
        const email = $('#auth-email').val().trim();
        const password = $('#auth-password').val().trim();

        console.log('Form submit type:', type, 'email:', email);

        if (!email || !password) {
            alert('Please fill all fields');
            return;
        }

        // Simulate API call
        setTimeout(() => {
            if (type === 'register') {
                console.log('Register flow');
                // Get existing users from localStorage or initialize empty array
                let users = JSON.parse(localStorage.getItem('users')) || [];

                // Check if email already registered
                if (users.some(user => user.email === email)) {
                    alert('Email already registered. Please login.');
                    // Keep modal in register mode, do not close or switch
                    return;
                }

                // Register new user
                const newUser = {
                    email,
                    password, // In real app, password should be hashed
                    username: email.split('@')[0],
                    joined: new Date().toISOString()
                };
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                currentUser = newUser;

                // Show thank you message and option to switch to login inside modal
                const $modal = $('#auth-modal');
                console.log('Registration successful: showing thank you message');
                $modal.find('.modal-title').text('Thank you for registering!');
                $modal.find('#auth-form').hide();
                // Try appending message and link directly inside modal
                $modal.find('.modal-body').empty();
                $modal.find('.modal-body').append('<p>Thank you for registering!</p>');
                if ($modal.find('#switch-to-login').length === 0) {
                    $modal.find('.modal-body').append('<p id="switch-to-login" style="cursor:pointer; color:blue; text-decoration:underline; margin-top:10px;">Click here to login</p>');
                }
            } else {
                console.log('Login flow');
                // Login flow
                let users = JSON.parse(localStorage.getItem('users'));
                if (!Array.isArray(users)) {
                    users = [];
                }
                const user = users.find(user => user.email === email);

                if (!user) {
                    alert('No account found with this email. Please register first.');
                    return;
                }

                if (user.password !== password) {
                    alert('Incorrect password. Please try again.');
                    return;
                }

                localStorage.setItem('currentUser', JSON.stringify(user));
                currentUser = user;
                alert('Login successful!');
                closeModal();
            }
            updateAuthUI();
        }, 500);
    });

    const searchData = {
        // Movies
        'black panther': {
            url: '/movies/action/black-panther.html',
            img: './images/movies/wakanda.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'avengers endgame': {
            url: '/movies/action/black-panther.html',
            img: './images/movies/endgame.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'john wick': {
            url: '/movies/action/black-panther.html',
            img: './images/movies/john-wick.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'mad max': {
            url: '/movies/action/black-panther.html',
            img: './images/movies/mad-max.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'the dark knight': {
            url: '/movies/action/black-panther.html',
            img: './images/movies/dark-knight.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'mission impossible': {
            url: '/movies/action/black-panther.html',
            img: './images/movies/mission.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'transformers': {
            url: '/movies/action/black-panther.html',
            img: './images/movies/transformer.jpg',
            rating: '9.5',
            duration: '120 mins'
        },
        'deadpool': {
            url: '/movies/action/black-panther.html',
            img: './images/movies/deadpool.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'captain marvel': {
            url: '/movies/action/black-panther.html',
            img: './images/movies/captain-marvel.png',
            rating: '9.5',
            duration: '120 mins'
        },
        'bloodshot': {
            url: '/movies/action/black-panther.html',
            img: './images/movies/blood-shot.jpg',
            rating: '9.5',
            duration: '120 mins'
        },
        'batman': {
            url: '/movies/action/black-panther.html',
            img: './images/movies/bat-man.jpg',
            rating: '9.5',
            duration: '120 mins'
        },
        
        // Series
        'the mandalorian': {
            url: '/series/wandavision.html',
            img: './images/series/mandalorian.jpg',
            rating: '9.5',
            duration: '120 mins'
        },
        'the witcher': {
            url: '/series/wandavision.html',
            img: './images/series/witcher.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'game of thrones': {
            url: '/series/wandavision.html',
            img: './images/series/got.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'stranger things': {
            url: '/series/wandavision.html',
            img: './images/series/stranger-thing.jpg',
            rating: '9.5',
            duration: '120 mins'
        },
        'the boys': {
            url: '/series/wandavision.html',
            img: './images/series/the-boys.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'loki': {
            url: '/series/wandavision.html',
            img: './images/series/loki.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'daredevil': {
            url: '/series/wandavision.html',
            img: './images/series/daredevil.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'jack ryan': {
            url: '/series/wandavision.html',
            img: './images/series/jack-ryan.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'supergirl': {
            url: '/series/wandavision.html',
            img: './images/series/supergirl.jpg',
            rating: '9.5',
            duration: '120 mins'
        },
        'star trek': {
            url: '/series/wandavision.html',
            img: './images/series/star-trek.jpg',
            rating: '9.5',
            duration: '120 mins'
        },
        'penthouses': {
            url: '/series/wandavision.html',
            img: './images/series/penthouses.jpg',
            rating: '9.5',
            duration: '120 mins'
        },
        'the falcon and the winter soldier': {
            url: '/series/wandavision.html',
            img: './images/series/the-falcon.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'wandavision': {
            url: '/series/wandavision.html',
            img: './images/series/wanda.png',
            rating: '9.5',
            duration: '120 mins'
        },
        'wanda vision': {
            url: '/series/wandavision.html',
            img: './images/series/wanda.png',
            rating: '9.5',
            duration: '120 mins'
        },
        
        // Cartoons/Anime
        'demon slayer': {
            url: '/cartoons/demon-slayer.html',
            img: './images/cartoons/demon-slayer.jpg',
            rating: '9.5',
            duration: '120 mins'
        },
        'attack on titan': {
            url: '/cartoons/demon-slayer.html',
            img: './images/cartoons/aot.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'jujutsu kaisen': {
            url: '/cartoons/demon-slayer.html',
            img: './images/cartoons/jujutsu.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'avatar the last airbender': {
            url: '/cartoons/demon-slayer.html',
            img: './images/cartoons/avatar.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'naruto shippuden': {
            url: '/cartoons/demon-slayer.html',
            img: './images/cartoons/naruto.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'one punch man': {
            url: '/cartoons/demon-slayer.html',
            img: './images/cartoons/one-punch.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'my hero academia': {
            url: '/cartoons/demon-slayer.html',
            img: './images/cartoons/my-hero.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'castlevania': {
            url: '/cartoons/demon-slayer.html',
            img: './images/cartoons/castlevania.webp',
            rating: '9.5',
            duration: '120 mins'
        },
        'croods': {
            url: '/cartoons/demon-slayer.html',
            img: './images/cartoons/croods.jpg',
            rating: '9.5',
            duration: '120 mins'
        },
        'dragonball': {
            url: '/cartoons/demon-slayer.html',
            img: './images/cartoons/dragon.jpg',
            rating: '9.5',
            duration: '120 mins'
        },
        'over the moon': {
            url: '/cartoons/demon-slayer.html',
            img: './images/cartoons/over-the-moon.jpg',
            rating: '9.5',
            duration: '120 mins'
        },
        'weathering with you': {
            url: '/cartoons/demon-slayer.html',
            img: './images/cartoons/weathering.jpg',
            rating: '9.5',
            duration: '120 mins'
        },
        'your name': {
            url: '/cartoons/demon-slayer.html',
            img: './images/cartoons/your-name.jpg',
            rating: '9.5',
            duration: '120 mins'
        },
        'coco': {
            url: '/cartoons/demon-slayer.html',
            img: './images/cartoons/coco.jpg',
            rating: '9.5',
            duration: '120 mins'
        }
    };
    
    // Handle search functionality
    $('#search-btn').on('click', function(e) {
        e.preventDefault();
        performSearch();
    });

    $('#search-input').on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            performSearch();
        }
    });

    function performSearch() {
        const searchTerm = $('#search-input').val().toLowerCase().trim();
        let found = false;

        // Check if search term matches any of our keys
        for (const [key, value] of Object.entries(searchData)) {
            if (searchTerm.includes(key)) {
                window.location.href = value.url;
                found = true;
                break;
            }
        }

        // If no match found, redirect to a default page (black-panther.html)
        if (!found) {
            window.location.href = '/movies/action/black-panther.html';
        }
    }

    // Optional: Show search suggestions as user types
    $('#search-input').on('input', function() {
        const searchTerm = $(this).val().toLowerCase().trim();
        const $searchResults = $('#search-results');
        
        if (searchTerm.length === 0) {
            $searchResults.empty().hide();
            return;
        }

        const matches = Object.keys(searchData).filter(key => 
            key.includes(searchTerm)
        ).slice(0, 5); // Show max 5 results

        if (matches.length > 0) {
            $searchResults.empty();
            matches.forEach(match => {
                const item = searchData[match];
                $searchResults.append(`
                    <div class="search-result-item" style="display:flex; align-items:center; cursor:pointer; padding:5px;">
                        <img src="${item.img}" alt="${match}" style="width:50px; height:70px; object-fit:cover; margin-right:10px; border-radius:4px;" />
                        <div>
                            <div style="font-weight:bold;">${match}</div>
                            <div style="font-size:0.85rem; color:#888;">Rating: ${item.rating} | Duration: ${item.duration}</div>
                        </div>
                    </div>
                `);
            });
            $searchResults.show();
        } else {
            $searchResults.hide();
        }
    });

    // Handle click on search suggestions
    $(document).on('click', '.search-result-item', function() {
        const suggestion = $(this).find('div > div:first-child').text();
        $('#search-input').val(suggestion);
        $('#search-results').hide();
        performSearch();
    });

    // Hide search results when clicking elsewhere
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.search-container').length) {
            $('#search-results').hide();
        }
    });

    // Initialize
    updateAuthUI();

    // Handle window resize
    $(window).resize(function() {
        if ($(window).width() > 850) {
            $('#hamburger-menu').removeClass('active');
            $('#nav-menu').removeClass('active');
            $('.dropdown-menu').css('display', '');
        }
    });
});