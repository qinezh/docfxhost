$("#popup").click(function () {
  console.log("clicked");
  window.open("/signin", "GitHub oauth", "width=700, height=500, scrollbars=no, menubar=no");
});

$('input[type="checkbox"]').on('change', function() {
   $('input[type="checkbox"]').not(this).prop('checked', false);
});