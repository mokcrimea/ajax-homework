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
    var info = {},
        inf_Class = document.body.getElementsByClassName('inf')[0],
        avatar = document.body.getElementsByClassName('avatar')[0];
    if (window.localStorage) {
        if (localStorage[user]) {
            checkDate(user);
        } else {
            findUser(user);
        }
    } else {
        findUser(user);
    }


    /**
     * Функция парсит данные полученные с помощью XMLHttpRequest и записывает их в DOM
     */

    function parseUserInfo(data) {
        showBlock();
        //Эта часть заполняет информацию о пользователе
        avatar.src = data.avatar_url.toString();
        inf_Class.children[0].innerHTML = 'Login: ' + '<strong>' + data.login + '</strong>';
        if (data.name) inf_Class.children[1].textContent = 'Name: ' + data.name;
        if (data.email) inf_Class.children[2].textContent = 'email: ' + data.email;
        inf_Class.children[3].textContent = 'Followers: ' + data.followers;
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
                for (var i = 0; i < inf_Class.childElementCount; i++) {
                    inf_Class.children[i].textContent = '';
                }
                inf_Class.children[0].innerHTML = 'The user ' + '<strong>' + user + '</strong>' + ' is not found';
                avatar.src = '';
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
                    date: new Date().valueOf()
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
     * Функция проверяет даты записей информации о пользователе в localStorage.
     * Если запись была сделана > 24 часа назад - удаляет запись, если это
     * искомый пользователь тогда отправляет запрос на сервер. Если записи < 24 часа
     * парсит локальные данные
     */

    function checkDate(user) {
        for (var i = 0; i < localStorage.length; i++) {
            var userInLocalStorage = JSON.parse(localStorage[localStorage.key(i)]);

            if (new Date().valueOf() - userInLocalStorage.date > 86400000) {
                if (localStorage.key(i) == user) {
                    findUser(user);
                } else {
                    localStorage.removeItem(localStorage.key(i));
                }
            } else if (localStorage.key(i) == user) {
                parseUserInfo(userInLocalStorage);
            }
        }
    }

    function showBlock() {
        document.body.getElementsByClassName('result')[0].style.display = 'block';
    }

}
