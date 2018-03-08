$(document).ready(function () {
  // textarea in .cart_header has auto height
  $('.cart_header').on('change keyup keydown paste cut', 'textarea', function () {
    $(this).height(0).height(this.scrollHeight);
  }).find('textarea').change();

  // menu button left
  function menuClear() {
    $(".menu").find(".d-clear").click(function () {
      $(".contents").slideUp();
      zm = $(this).parent("div").attr('id');
      $('.content_' + zm).slideToggle();
    });
  }

  // menu button left
  function menuAdd() {
    $(".menu").find(".d-add").click(function () {
      var self = this;
      var zm = $(this).parent("div").attr('id');
      self._open = self._open || false;
      $('.content_' + zm).slideToggle('fast', function () {
        if(self._open) {
          $(self).text('+');
        } else {
          $(self).text('-');
        }
        self._open = !self._open;
      });
    });
  }

  // menu hotel header
  function menuHotel() {
    $(".box_hotel_header").click(function () {
      idDiv = $(this).find('input').first().data("hotel_id");
      dataDiv = $(this).find('input').first().data("hotel_data");
      $("#" + idDiv + '_' + dataDiv).slideToggle();
    });
  }

  // add comment in cart
  $(".CartContentRow").find(".comment").click(function () {
    $(this).parent().find(".cart_header").slideToggle();
    // css('background-color', 'red').css('border', '3px solid black');
  });

  $(".not_show").hide();

  // delete cart .remove();
  $(".CartContentRow").find(".delete").click(function () {
    $(this).parent().fadeOut(1000, function () {
      $(this).remove();
    });
    // css('background-color', 'red').css('border', '1px solid yellow');
  });

  // change icon
  $(".tAreaComment").on('change', function () {
    icon = $(this).parent().parent().find(".comment").find("i");
    if ($(this).val() == "") {
      icon.removeClass("fa-commenting").addClass("fa-commenting-o");
    } else {
      icon.removeClass("fa-commenting-o").addClass("fa-commenting");
    }
  });

  // ClickEventNumber
  $(".kr").not(".box_hotel_header .kr").click(function () {
    // var value_CEN = $(this).val();
    // if (value_CEN) { value_CEN = parseInt($(this).val()); } else { value_CEN = 0; }
    // var w = value_CEN + parseInt($('#LW').val());

    // $(this).toggleClass("kr-green").val(w);
    // // alert(w);
  });

  $('.rooms').each(function (in1) {
    var suma = 0;
    var id = $(this).attr('id').split('_');
    $(this).find('.box_hotel_content input').each(function (in2) {
      var value = $(this).val();
      if (value) {
        suma += parseInt(value);
      }
      // $(".zbiornik").append('v:' + value + ' s:' + suma + ' | ' + in1 + '-' + in2 + '<br>');
    });
    var link = 'hh_' + id[0] + '_' + id[1];
    $('#' + link).find('input').val(suma);
    // $('.zbiornik').append(link + suma +' <hr>');

  });


  menuClear();
  menuAdd();
  menuHotel();
});
