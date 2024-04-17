$(document).ready(function () {
  $(".delete-job").on("click", function (e) {
    // Get id when button clicked
    $target = $(e.target);
    const id = $target.attr("data-id");
    $.ajax({
      type: "DELETE",
      url: "/job/" + id,
      success: function (response) {
        alert("Deleting Job");
        window.location.href = "/";
      },
      error: function (err) {
        console.log(err);
      },
    });
  });
});
