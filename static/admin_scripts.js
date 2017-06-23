new Pikaday({ field: document.querySelector('#date'), format: "YYYY-MM-DD", trigger: document.querySelector('#datepicker'), onClose: function(date) {
    if(document.querySelector('#date').value !== "") {
        window.location = `/admin/day?date=${document.querySelector('#date').value}`;
    }
}});

document.querySelector('#search').addEventListener('keypress', function(e) {
    if(e.key === "Enter") {
        window.location = `/admin/days?date=${this.value}`;
    }
});

if(document.querySelector("#login")) {
    document.querySelector("#login").addEventListener('click', function () {
        document.querySelector("#login_form").submit();
    });
}