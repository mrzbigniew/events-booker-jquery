
(function ($) {
  $.fn.basket = function (conf) {
    var $self = this,
      items = [],
      itemBuilder = conf.itemBuilder,
      dataNormalizer = conf.dataNormalizer
      ;

    this.addItem = function ($item) {
      var $basketItem = itemBuilder($item, dataNormalizer);
      setBasketItemInitialCss($basketItem);
      addBasketItemToContainer($basketItem);
      runBasketItemShowAnimation($basketItem);
      linkItems($item, $basketItem);
    }

    this.deleteItem = function ($item) {
      var linkedData = fetchLinkedDataForItem($item),
        $basketItem;
      if (linkedData) {
        $basketItem = linkedData.basketItem;
        runBasketItemHideAnimation($basketItem, function () {
          delBasketItemFromContainer($basketItem);
        });
      }
    }

    this.getAllItems = function () {
      return items;
    }

    this.getItemsCount = function () {
      return items.length;
    }

    function linkItems($item, $basketItem) {
      items.push({
        basketItem: $basketItem,
        item: $item
      });
    }

    function fetchLinkedDataForItem($item) {
      var index,
        itemData = $item.data(),
        currentItemData,
        currentElement;

      for (index = 0; index < items.length; index++) {
        currentElement = items[index];
        currentItemData = currentElement.item.data();
        if (currentItemData._id === itemData._id) {
          return fetchItemFromLinkedArray(index);
        }
      }
    }

    function fetchItemFromLinkedArray(index) {
      var arrayData = items.splice(index, 1);
      return arrayData[0];
    }

    function setBasketItemInitialCss($basketItem) {
      $basketItem.css('display', 'none');
    }

    function addBasketItemToContainer($basketItem) {
      $basketItem.appendTo($self);
    }

    function delBasketItemFromContainer($basketItem) {
      $basketItem.remove();
    }

    function runBasketItemShowAnimation($basketItem, callback) {
      $basketItem.show('slow', callback);
    }

    function runBasketItemHideAnimation($basketItem, callback) {
      $basketItem.hide('slow', callback);
    }

    return this;
  };
}(jQuery));

(function ($) {
  $.fn.ordersApp = function (conf) {
    var $self = this,
      items = {
        'hotel_room': [],
        'event_time': [],
        'hotel_data': []
      },
      config = conf || { itemsSelector: 'input[order-item]' },
      basketSelector = conf.basketSelector || '.cart_content',
      handleClick = _handleItemClick,
      dataStandardizer = _dataStandardizer,
      $basket = $(basketSelector).first().basket({
        itemBuilder: _itemBuilder
      }),
      $lwField = $('#LW');

    this.getAllItems = function () {
      return items;
    }

    function getHotelDataItemForHotelRoom($item) {
      var index,
        $hotelDataItem,
        $current,
        data = $item.data(),
        hotelDataItems = items['hotel_data'],
        cmpMap = ['event_id', 'hotel_id', 'hotel_data'];

      for (index = 0; index < hotelDataItems.length; index++) {
        $current = hotelDataItems[index];
        currentData = $current.data();
        if (compareData(currentData, data, cmpMap)) {
          return $current;
        }
      }
      return null;
    }

    function compareData(data1, data2, keyMap) {
      var key, i;
      for (i = 0; i < keyMap.length; i++) {
        key = keyMap[i];
        if (data1[key] !== data2[key]) {
          return false;
        }
      }
      return true;
    }

    function addClickEvent($item) {
      $item.click(function () {
        return handleClick($(this));
      });
    }

    function initItems() {
      $self.find(config.itemsSelector).each(function (index, input) {
        $item = $(input);
        var dataType = $item.data('type');
        if (dataType === 'hotel_room' || dataType === 'event_time' || dataType === 'hotel_data') {
          $item.data('_id', index);
          standardizeData($item);
          if (dataType === 'hotel_room' || dataType === 'event_time') {
            putInToBasketIfInOrder($item);
            addClickEvent($item);
          }
          items[dataType].push($item);
        }
      });
    }

    function standardizeData($item) {
      var data = $item.data(),
        kay;
      standardizedData = dataStandardizer(data);
      for (key in standardizedData) {
        $item.data(key, standardizedData[key]);
      }
    }

    function putInToBasketIfInOrder($item) {
      var data = $item.data();
      if (data.orderValue) {
        addToBasket($item);
        addGreenClass($item);
      }
    }

    function addLWEvent() {
      $lwField.change(function () {
        var $lw = $(this),
          lwValue = +($lw.val() || 0),
          index,
          events = items['event_time'],
          $item,
          itemData,
          max;

        if (lwValue < 1) {
          $lw.val(1);
          lwValue = 1;
        }

        for (index = 0; index < events.length; index++) {
          $item = events[index];
          itemData = $item.data();
          max = + (itemData.max || 0);
          valueToCheck = +(itemData.value || 0) + lwValue;
          if (valueToCheck > max) {
            $item.addClass('kr-off').removeClass('kr-on');
          }
          else {
            $item.addClass('kr-on').removeClass('kr-off');
          }
        }
      });
    }

    function _handleItemClick($item) {
      updateItem($item);
    }

    function checkChangeInputValue($item, newValue) {
      var data = $item.data(),
        max = + (data.max || 0),
        min = + (data.value || 0),
        initialValue = +(data.value || 0),
        newInputValue = newValue;
      if (newValue > max || newValue < min) {
        return false;
      }
      return true;
    }

    function changeItemValue($item, orderValue) {
      var data = $item.data(),
        newInputValue = +(data.value || 0) + orderValue;

      if (checkChangeInputValue($item, newInputValue)) {
        updateInputValue($item, newInputValue);
        updateOrderValue($item, orderValue);
      }
    }

    function addGreenClass($item) {
      $item.addClass('kr-green');
    }

    function delGreenClass($item) {
      $item.removeClass('kr-green');
    }

    function addToBasket($item) {
      $basket.addItem($item);
    }

    function delFromBasket($item) {
      $basket.deleteItem($item);
    }

    function updateOrderValue($item, value) {
      $item.data('orderValue', value);
    }

    function updateInputValue($item, value) {
      $item.val(value);
    }

    function addHotelRoomValue($item) {
      var data = $item.data(),
        $hotelDataItem = getHotelDataItemForHotelRoom($item),
        inputValue = +(data.max || 0),
        orderValue = inputValue,
        hotelDataValue = + ($hotelDataItem.val() || 0) + orderValue;

      if (data.value) {
        return; // prevent from booking room when room is booked already
      }

      updateInputValue($hotelDataItem, hotelDataValue);
      updateOrderValue($item, orderValue);
      updateInputValue($item, inputValue);
      addToBasket($item);
      addGreenClass($item);
    }

    function delHotelRoomValue($item) {
      var data = $item.data(),
        $hotelDataItem = getHotelDataItemForHotelRoom($item),
        itemOrderDataValue = +(data.orderValue || 0),
        hotelDataItemValue = +($hotelDataItem.val() || 0) - itemOrderDataValue;

      updateInputValue($item, '');
      updateInputValue($hotelDataItem, hotelDataItemValue);
      updateOrderValue($item, null);
      delFromBasket($item);
      delGreenClass($item);
    }

    function updateHotelRoomValue($item) {
      var data = $item.data();
      if (!data.orderValue) {
        addHotelRoomValue($item);
      } else {
        delHotelRoomValue($item);
      }
    }

    function addEventValue($item) {
      var data = $item.data(),
        lwValue = +$lwField.val(),
        inputValue = +(data.value || 0) + lwValue,
        orderValue = lwValue;

      if (!checkChangeInputValue($item, inputValue)) {
        return; // prevent from overload booking
      }

      updateInputValue($item, inputValue);
      updateOrderValue($item, orderValue);
      addToBasket($item);
      addGreenClass($item);
    }

    function delEventValue($item) {
      var data = $item.data(),
        inputValue = +(data.value || 0) || '';

      updateInputValue($item, inputValue);
      updateOrderValue($item, null);
      delFromBasket($item);
      delGreenClass($item);
    }

    function updateEventValue($item) {
      var data = $item.data();
      if (!data.orderValue) {
        addEventValue($item);
      } else {
        delEventValue($item);
      }
    }

    function updateItem($item) {
      var data = $item.data();

      if (data.type === 'hotel_room') {
        updateHotelRoomValue($item);
      } else {
        updateEventValue($item);
      }
    }

    function deleteItem($item) {
      var data = $item.data();
      if (data.type === 'hotel_room') {
        delHotelRoomValue($item);
      } else {
        delEventValue($item);
      }
    }

    function _itemBuilder($item) {
      var data = $item.data();
      var $br = $('<br/>');
      var $container = $('<div/>').addClass('CartContentRow').addClass('radius');
      var $headContent = $('<span/>').addClass('cartHeadContent').text(data.event_name).appendTo($container);
      $container.append('&nbsp;');
      $container.append('&nbsp;');

      var $delete = $('<span/>')
        .addClass('delete')
        .appendTo($container);

      var $basketIcon = $('<i style="color:#CA0B0E;font-size: 1.5em;" class="fa fa-2x fa-trash" aria-hidden="true" />');
      $basketIcon.appendTo($delete);

      $container.append('&nbsp;');
      $container.append('&nbsp;');

      var $comment = $('<span />')
        .addClass('comment')
        .appendTo($container);

      var $commentIcon = $('<i style="color:#4ec400;font-size: 2.0em;" class="fa fa-commenting-o" aria-hidden="true" />');
      $commentIcon.appendTo($comment)

      $container.append($br);

      var $itemName = $('<font />').css('color', 'white')
        .text(data.name + ' x ')
        .appendTo($container);

      var $inputField = $('<input />').attr('type', 'number')
        .attr('name', '')
        .val(data.orderValue)
        .addClass('cart_num form-control')
        .appendTo($container)
        .prop('disabled', data.type === 'hotel_room');

      var $noteContainer = $('<div />')
        .addClass('cart_header')
        .css('display', 'none')
        .appendTo($container);

      var $textareaContent = $('<textarea placeholder="notatka" class="tear_c text_customer radius tAreaComment"/>');
      $textareaContent.change(function () {
        if ($textareaContent.val() === '') {
          $commentIcon.removeClass('fa-commenting').addClass('fa-commenting-o');
        } else {
          $commentIcon.removeClass('fa-commenting-o').addClass('fa-commenting');
        }
      })
      $textareaContent.appendTo($noteContainer);

      $inputField.change(function (event) {
        var data = $item.data(),
          fieldValue = +($(this).val() || 0),
          newInputValue = +(data.value || 0) + fieldValue,
          orderValue;

        if (data.type === 'hotel_room' || !checkChangeInputValue($item, newInputValue)) {
          orderValue = + (data.orderValue || 0);
          $(this).val(orderValue);
        } else {
          changeItemValue($item, +$(this).val());
        }
      });

      $delete.click(function () {
        $delete.off('click');
        deleteItem($item);
      });

      $comment.click(function () {
        $noteContainer.slideToggle();
      });

      return $container;
    }

    function _dataStandardizer(data) {
      var ret = {},
        standardKeysInOrder = ['_id', 'event_id', 'id', 'type', 'title', 'name', 'date', 'value', 'orderValue', 'max'],
        dataType = data.type,
        dataKey,
        valKey,
        dataValue,
        map = {
          'event_time': [
            '_id', 'event_id', null, 'type', 'event_name',
            function (data) {
              return new Date(parseInt(data['udate'], 10) * 1000).toFormatedString('%a, %e %b %y %H:%M');
            },
            function (data) {
              return new Date(parseInt(data['udate'], 10) * 1000)
            },
            function (data) {
              return parseInt(data.value || 0, 10) - parseInt(data.uexists || 0, 10);
            },
            'uexists', 'umax'
          ],
          'hotel_room': [
            '_id', 'event_id', null, 'type', 'event_name',
            function (data) {
              var formatedStringDate = new Date(parseInt(data['hotel_data'], 10) * 1000).toFormatedString('%a, %e %b %y');
              return data['roomname'] + ' ' + formatedStringDate;
            },
            function (data) {
              return new Date(parseInt(data['hotel_data'], 10) * 1000)
            },
            function (data) {
              return parseInt(data.value || 0, 10) - parseInt(data.uexists || 0, 10);
            },
            'uexists', 'roommax'
          ],
          'hotel_data': [
            '_id', 'event_id', null, 'type', 'event_name', null,
            function (data) {
              return new Date(parseInt(data['hotel_data'], 10) * 1000)
            },
            function (data) {
              return parseInt(data.value || 0, 10) - parseInt(data.uexists || 0, 10);
            },
            null, null
          ]
        };

      for (i = 0; i < standardKeysInOrder.length; i++) {
        dataKey = standardKeysInOrder[i];
        valKey = map[dataType][i];
        dataValue = valKey ? (typeof valKey === 'function' ? valKey(data) : data[valKey]) : null;

        ret[standardKeysInOrder[i]] = dataValue;
      }
      return ret;
    }

    function disableSaveButton() {
      $self.find('.save-button').prop('disabled', true);
    }

    function enableSaveButton() {
      $self.find('.save-button').prop('disabled', false);
    }

    function validCustomerField() {
      var $field = $self.find('textarea[name="customer"]');
      return $field.val() !== '';
    }

    function validContactField() {
      var $field = $self.find('textarea[name="kontakt"]');
      return $field.val() !== '';
    }

    function validEmailField() {
      var $field = $self.find('textarea[name="email"]'),
        value = $field.val(),
        regExp = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/g;
      return regExp.test(value);
    }

    function isBasketEmpty() {
      return $basket.getItemsCount() === 0;
    }

    function handleFormChange() {
      //var itemsNameList = ['customer', 'kontakt', 'email'];
      if (validCustomerField() && validContactField() && validEmailField() && !isBasketEmpty()) {
        enableSaveButton();
      } else {
        disableSaveButton();
      }
    }

    function addBasketClientDataEvents() {
      $('.cart_header > textarea').on('change keyup', function (event) {
        handleFormChange();
      });
    }

    function addSaveButtonEvent() {
      $('.save-button').click(function () {
        $saveButton = $(this);
        if ($saveButton.prop('disabled')) {
          return false;
        }
        saveBasket();
      });
    }

    function saveBasket() {
      var items = $basket.getAllItems(),
        item = null,
        dataToSend = [];
      for (var index = 0; index < items.length; index++) {
        item = items[index].item;
        dataToSend.push(item.data());
      }
      $.post('', JSON.stringify(dataToSend.map((item) => {
        item.date = item.date.getTime() / 1000;
        return item;
      })))
        .done(doAfterSuccessfulBasketSave)
        .fail(doAfterFailSave);
    }

    function doAfterFailSave(err) {
      console.log(err);
    }

    function doAfterSuccessfulBasketSave(data) {
      console.log(data);
    }

    initItems();
    addLWEvent();
    addSaveButtonEvent();
    disableSaveButton();
    addBasketClientDataEvents();

    return this;
  }
}(jQuery));

$(document).ready(function () {
  var $app = $(document.body).ordersApp({
    itemsSelector: 'input[data-type]',
    basketSelector: '.cart_content'
  });
});
