var info = {};
document.body.getElementsByTagName('button')[0].addEventListener('click', function() {
    checkLocalStorage(document.body.getElementsByTagName('input')[0].value.toLowerCase());
});
document.body.getElementsByTagName('input')[0].addEventListener('keydown', function(e) {
    if (e.which == 13) {
        checkLocalStorage(e.target.value.toLowerCase());
    }
});

/**
 * Функция проверки localStorage на наличие пользователя
 */

function checkLocalStorage(user) {
    if (window.localStorage) {
        if (localStorage[user]) {
            checkDate(JSON.parse(localStorage[user]));
        } else {
            findUser(user);
        }
    }
}

/**
 * Функция парсит данные полученные с помощью XMLHttpRequest и записывает их в DOM
 */

function parseUserInfo(data) {
    showBlock();
    //Эта часть заполняет информацию о пользователе
    document.body.getElementsByClassName('avatar')[0].src = data.avatar_url.toString();
    document.body.getElementsByClassName('inf')[0].children[0].innerHTML = 'Login: ' + '<strong>' + data.login + '</strong>';
    if (data.name) document.body.getElementsByClassName('inf')[0].children[1].textContent = 'Name: ' + data.name;
    if (data.email) document.body.getElementsByClassName('inf')[0].children[2].textContent = 'email: ' + data.email;
    document.body.getElementsByClassName('inf')[0].children[3].textContent = 'Followers: ' + data.followers;
    //Эта часть заполняет информацию о репозиториях
    document.getElementsByClassName('repos')[0].textContent = 'Public repos.:';
    var repos = document.getElementsByClassName('repos')[0];
    data.repos.forEach(createLinks);

    function createLinks(element) {
        var newA = document.createElement('a');
        newA.className = 'repo-link';
        newA.href = element['html_url'];
        newA.textContent = element['name'];
        repos.appendChild(newA);
    }
}
/**
 * Функция посылает XMLHttpRequest запрос на получение данных о пользователе.
 */

function findUser(user) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.github.com/users/' + user, true);

    xhr.onreadystatechange = function() {
        if (this.readyState != 4) return;
        if (this.status == 404) {
            //Если пользователь не существует.
            showBlock();
            for (var i = 0; i < document.body.getElementsByClassName('inf')[0].childElementCount; i++) {
                document.body.getElementsByClassName('inf')[0].children[i].textContent = '';
            }
            document.body.getElementsByClassName('inf')[0].children[0].innerHTML = 'The user ' + '<strong>' + user + '</strong>' + ' is not found';
            document.body.getElementsByClassName('avatar')[0].src = '';
            return;
        }
        if (this.status == 200) {
            info = JSON.parse(this.response);
            findRepos(user);
        }
    };
    xhr.send(null);
}

function findRepos(user) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.github.com/users/' + user + "/repos", true);

    xhr.onreadystatechange = function() {
        if (this.readyState != 4) return;

        info.repos = JSON.parse(this.response);
        setLocalStorage(info);
        parseUserInfo(info);
    };
    xhr.send(null);
}
/**
 * Функция записывает данные о пользователе в localStorage
 */

function setLocalStorage(elem) {
    if (window.localStorage) {
        var user_select = [],
            temp = {
                repos: [],
                date: new Date()
            };
        user_select = ['avatar_url', 'login', 'name', 'email', 'followers'];
        user_select.forEach(function(item) {
            temp[item] = elem[item];
        });
        elem.repos.forEach(function(repository, index) {
            temp.repos[index] = {
                'html_url': repository['html_url'],
                'name': repository['name']
            };
        });
        localStorage.setItem(elem.login.toLowerCase(), JSON.stringify(temp));
    }
}

/**
 * Функция проверяет дату записи информации о пользователе в localStorage.
 * Если запись была сделана > 24 часа назад, отправляет запрос на сервер иначе
 * парсит данные записанные локально.
 */

function checkDate(user) {
    if (new Date() - new Date(user.date) > 86400000) {
        findUser(user);
    } else {
        parseUserInfo(user);
    }
}

function showBlock() {
    document.body.getElementsByClassName('result')[0].style.display = 'block';
}
