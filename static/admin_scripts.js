let picker = new Pikaday({ field: document.querySelector('#date'), format: "YYYY-MM-DD", trigger: document.querySelector('#datepicker'), onClose: function(date) {
    window.location = `/admin/days?date=${document.querySelector('#date').value}`;
}});

document.querySelector('#search').addEventListener('keypress', function(e) {
    if(e.key === "Enter") {
        window.location = `/admin/days?date=${this.value}`;
    }
});

document.querySelector("#login").addEventListener('click', function() {
    document.querySelector("#login_form").submit();
});