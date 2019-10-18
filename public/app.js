const appendProject = project => {
  $("table tbody").append(`
    <tr>
      <td>${project.name}</td>
      <td>${project.description}</td>
      <td>${moment(project.creationDate).format("DD/MM/YYYY kk:mm")}</td>
    </tr>
  `);
}

const loadProjects = () => {
  $.ajax({
    url: "/projects"
  }).done(projects => {
    $("#projects").show();
    projects.forEach(project => appendProject(project));
  }).fail(err => {
    if (err.status === 401) {
      $("#login").show();
    } else {
      console.log("Error", err)
    }
  });
};

loadProjects();

//
$("form#new-project").on("submit", e => {
  e.preventDefault();

  // limpiar los errores
  $("span.error").remove();

  const name = $("#name").val();
  const description = $("#description").val();

  $.ajax({
    method: "POST",
    url: "/projects",
    contentType: "application/json",
    data: JSON.stringify({ name, description })
  }).done(project => {
    appendProject(project);

    $("#name").val("");
    $("#description").val("");
  }).fail(err => {
    if (err.status === 422) {
      const errors = err.responseJSON.errors;
      if (errors.name) {
        $(`<span class="error">${errors.name.message}</span>`).insertAfter("#name");
      }
    } else {
      console.log("Error: ", err);
    }
  });
});

$("#login-form").on("submit", e => {
  e.preventDefault();

  alert("Login");
});

$("form#register-form").on("submit", e => {
  e.preventDefault();

  const email = $("#register-email").val();
  const password = $("#register-password").val();

  $.ajax({
    method: "POST",
    url: "/register",
    contentType: "application/json",
    data: JSON.stringify({ email, password })
  }).done(response => {
    $("#register").hide();
    $("#projects").show();
    loadProjects();
  }).fail(err => {
    console.log(err);
  });
});

$(".register-link").on("click", e => {
  e.preventDefault();

  $("#login").hide();
  $("#register").show();
})
