function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


/* database part */
var db;
var version = 0.1337;
var dbName = "transDB";
var dbDisplayName = "transactionBase";
//размер базы данных в байтах
var dbSize = 2 * 1024 * 1024;

function initDB() {
  if (window.openDatabase) {
    db = openDatabase(dbName, version, dbDisplayName, dbSize);
    db.transaction(function (t) {
      t.executeSql(
        "CREATE TABLE transactions(DaTi DATETIME PRIMARY KEY, transType INTEGER, amount REAL)",
        []);
    });
    console.log("DB created");
  }
  else { alert('Web SQL Database not supported in this browser'); }
}
initDB();

function insertData(db, DaTi, transType, amount) {
  db.transaction(function (t) {
    t.executeSql("INSERT or REPLACE INTO transactions(DaTi, transType, amount) VALUES (?, ?, ?)",
      [DaTi, transType, amount])
  });
}

function dropData() {
  db.transaction(function (t) {
    t.executeSql("delete from transactions", [])
  });
  console.debug("Таблица очищена")
}

function dropExact(dateandtime) {
  db.transaction(function (t) {
    t.executeSql("delete from transactions where DaTi=?;", [dateandtime])
  });
  console.debug(`Элемент ${dateandtime} удален`)
}

function confirmDelete() {
  if (confirm('Удалить все данные о транзакциях?'))
    dropData();
  printFromDB2Table();
}

function confirmDeleteOne(dateandtime) {
  if (confirm('Удалить транзакцию?'))
    dropExact(dateandtime);
  printFromDB2Table();
}

function getOneValue2Change(DaTi) {
  var _transType, _amount;
  db.transaction(function (t) {
    t.executeSql("SELECT * FROM transactions where Dati=?", [DaTi],
      function (tran, r) {
        transType = document.getElementById("transType")
        amount = document.getElementById("amount")
        transType.value = r.rows.item(0).transType
        amount.value = r.rows.item(0).amount
      }
    )
  })
}


function printFromDB2Table(sortByData = "desc", sortByAmount = "") {
  //Вывод информации в таблицу
  var ht = document.getElementById("transactionTable");
  console.log(ht);
  //ht.innerHTML=""
  ht.innerHTML = "<tr><th>Дата и время</th><th>Тип</th><th>Сумма</th><th>Изменить</th><th>Удалить</th></tr>\n";
  var req = ""
  if (sortByData == "desc" || sortByData == "asc") {
    req = " order by DaTi " + sortByData;
    if (sortByData == "desc") arrow = `<a onclick='printFromDB2Table(sortByData="asc", sortByAmount="")'>Дата и время ↓</a>`;
    else arrow = `<a onclick='printFromDB2Table(sortByData="desc")'>Дата и время ↑</a>`;
    ht.innerHTML = `<tr><th>${arrow}</th><th>Тип</th><th><a onclick='printFromDB2Table(sortByData="", sortByAmount="desc")'>Сумма *</a></th><th>Изменить</th><th>Удалить</th></tr>\n`;
  }
  else if (sortByAmount == "desc" || sortByAmount == "asc") {
    req = " order by amount " + sortByAmount
    if (sortByAmount == "desc") arrow = `<a onclick='printFromDB2Table(sortByData="", sortByAmount="asc")'>Сумма ↓</a>`;
    else arrow = `<a onclick='printFromDB2Table(sortByData="", sortByAmount="desc")'>Сумма ↑</a>`;
    ht.innerHTML = `<tr><th><a onclick='printFromDB2Table(sortByData="desc")'>Дата и время *</a></th><th>Тип</th><th>${arrow}</th><th>Изменить</th><th>Удалить</th></tr>\n`;
  };
  db.transaction(function (t) {
    t.executeSql("SELECT * FROM transactions " + req, [],
      function (tran, r) {
        for (var i = 0; i < r.rows.length; i++) {
          var dateandtime = r.rows.item(i).DaTi;
          var transType = r.rows.item(i).transType;
          var amount = r.rows.item(i).amount;
          var rowid = r.rows.item(i).rowid;
          var change = `<button type='button' onclick='document.cookie="transID=${dateandtime}"; window.location.href="transChange.html"'>Изменить</button>`
          var del = `<button type='button' onclick='confirmDeleteOne("${dateandtime}")'>Удалить</button>`
          var bgcolor = ["D0FFD0", "FFD0D0"][transType]
          ht.innerHTML += "<tr bgcolor='" + bgcolor + "'><td>" + dateandtime + "</td><td>" + ["Поступление", "Снятие"][transType] + "</td><td>" + amount + "</td><td>" + change + "</td><td>" + del + "</td></tr>\n"
        }
      }
    )

  })


}


function getCreditAction() {
  //добавляет элемент
  zarplata = document.getElementById("zarplata").noUiSlider.get();

  supZarplata = document.getElementById("sup_zarplata").noUiSlider.get();
  if (document.getElementById("hasSpouse").checked) {
    supZarplata = "Отсутствует";
  }

  _HTMLTable = document.getElementsByName("transactionTable");
  HTMLTable = "";
  for (var i = 0, length = _HTMLTable.length; i < length; i++) {
    if (_HTMLTable[i].checked) {
      HTMLTable = _HTMLTable[i].value;
      break;
    }
  }
  creditSum = document.getElementById("credit_sum").noUiSlider.get();
  srok = document.getElementById("srok").noUiSlider.get();
  plata = document.getElementById("plateJ").innerHTML;
  //alert supZarplata, HTMLTable, creditSum, srok, plata);
  insertData(db, zarplata, supZarplata, HTMLTable, creditSum, srok[0], srok[1], plata);
  console.log("Record added");
  window.location.href = "login.html";
}
