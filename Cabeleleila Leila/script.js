const Storage = {
    get(){return JSON.parse(localStorage.getItem('')) || []},
    set(agendamentos) {localStorage.setItem('Cabeleleila', JSON.stringify(agendamentos))}
  }
  
  const Modal = {
    open(){document.querySelector('.modal-overlay').classList.add('active')},
    close(){document.querySelector('.modal-overlay').classList.remove('active')}
  }
  
  const ModalEdit = {
    open(){document.querySelector('.modal-overlay-edit').classList.add('active')},
    close(){document.querySelector('.modal-overlay-edit').classList.remove('active')},
    
    preenche(agendamento) {
      nameEdit = document.querySelector('input#nameEdit')
      serviceEdit = document.querySelector('input#serviceEdit')
      valorEdit = document.querySelector('input#valorEdit')
      dateEdit = document.getElementById('dateEdit')
      timeEdit = document.getElementById('timeEdit')
  
      let data = agendamento.date.split(/[s, /]+/)
      let dataSeparada = `${data[2]}-${data[1]}-${data[0]}`
  
      nameEdit.value = agendamento.name
      serviceEdit.value = agendamento.service
      valorEdit.value = agendamento.valor
      dateEdit.value = dataSeparada
      timeEdit.value = agendamento.time
    }
  }
  
  const manipularAgendamento = {
    all: Storage.get(),
  
    add(agendamento) {
      const lastId = manipularAgendamento.all[manipularAgendamento.all.length - 1]?.id || 0
      agendamento.id = lastId + 1
      manipularAgendamento.all.push(agendamento)
      App.reload()
    },
  
    remove(index) {
      manipularAgendamento.all.splice(index, 1)
      App.reload()
    },
  
    alteracao(id) {
      const agendamento = manipularAgendamento.all.find(agen => agen.id === id)
      agendamento.id = id
      let hoje = new Date()
      let dataAgen = agendamento.date.split(/[s, /]+/)
      let data = new Date(dataAgen[2], dataAgen[1] - 1, dataAgen[0])
      if (
        data.getDate() < hoje.getDate() + 2 &&
        hoje.getMonth() == data.getMonth() &&
        hoje.getYear() == data.getYear()
      ){}else{
        ModalEdit.open()
        if (!agendamento) {
          throw new Error('Agendamento não encontrado')
        }else{
        let form = document.querySelector('#EditForm')
        form.outerHTML = `
        <form id=\"EditForm\" action=\"\" onsubmit=\"Formulario.submitUpdate(event, ${id})\">\n
        <div class="input-group">
          <input type="text" id="nameEdit" name="nemeEdit" placeholder="Nome" value="${agendamento.name}"/>
        </div>
        
        <div class="input-group">
          <input type="text" id="serviceEdit" name="serviceEdit" placeholder="Serviço" value="${agendamento.service}">
        </div>
        
        <div class="input-group">
          <input type="number" id="valorEdit" name="valorEdit" placeholder="Valor" step="0.01" value="${agendamento.valor}">
        </div>
        
        <div class="input-group">
          <input type="date" id="dateEdit" name="dateEdit" value="${agendamento.date}">
        </div>
        
        <div class="input-group">
          <input type="time" id="timeEdit" name="timeEdit" min="08:00" max="18:00" value="${agendamento.time}">
        </div>
        
        <div class="input-group actions">
          <a href="#" onclick="ModalEdit.close()" class="button cancel">Cancelar</a>
          <button>Salvar</button>
        </div>
        </form>`
        ModalEdit.preenche(agendamento)
      }}
  },

    salvarAlteracao(agendamento, id) {
      manipularAgendamento.all.forEach(agen => {
        if (agen.id == id) {
          agen.name = agendamento.name
          agen.service = agendamento.service
          agen.valor = agendamento.valor
          agen.date = agendamento.date
          agen.time = agendamento.time
        }
      })
    }
  }
  
  const Tabela = {
  
    agendamentosCointainer: document.querySelector('#data-table tbody'),
  
    adicionarAgendamento(agendamento, index) {
      const tr = document.createElement('tr')
      tr.innerHTML = Tabela.tabelaAgendamento(agendamento, index)
      tr.dataset.index = index
  
      Tabela.agendamentosCointainer.appendChild(tr)
    },
  
    tabelaAgendamento(agendamento, index) {
      const valor = Utils.formataValor(agendamento.valor)
  
      const html = `
          <td class="id">${agendamento.id}</td>
          <td class="name">${agendamento.name}</td>
          <td class="service">${agendamento.service}</td>
          <td class="valor">R$ ${valor}</td>
          <td class="date">${agendamento.date}</td>
          
          <td>
            <a class = "remover" onclick="manipularAgendamento.remove(${index})">Remover</a>
            <a onclick="manipularAgendamento.alteracao(${agendamento.id})">Editar</a>
          </td>
        `
      return html
    },
  
    limparAgendamentos() {
      Tabela.agendamentosCointainer.innerHTML = ''
    }
  }
  
  
  const Utils = {
    formataValor(value) {
      const signal = Number(value) < 0 ? '-' : ''
      return signal + value
    },
  
    formataData(date, time) {
      let splittedDate = date.split('-')
  
      return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]} ${time}`
    }
  }
  
  const Formulario = {
    name: document.querySelector('input#name'),
    service: document.querySelector('input#service'),
    valor: document.querySelector('input#valor'),
    date: document.getElementById('date'),
    time: document.getElementById('time'),
  
    getValues() {
      return {
        name: Formulario.name.value,
        service: Formulario.service.value,
        valor: Formulario.valor.value,
        date: Formulario.date.value,
        time: Formulario.time.value
      }
    },
  
    nameEdit: document.querySelector('input#nameEdit'),
    serviceEdit: document.querySelector('input#serviceEdit'),
    valorEdit: document.querySelector('input#valorEdit'),
    dateEdit: document.getElementById('dateEdit'),
    timeEdit: document.getElementById('timeEdit'),
  
    getValuesEdit() {
      return {
        name: nameEdit.value,
        service: serviceEdit.value,
        valor: valorEdit.value,
        date: dateEdit.value,
        time: timeEdit.value
      }
    },
  
    validaCampos(x) {
      const {name, service, valor, date, time} =
        x != 1 ? Formulario.getValues() : Formulario.getValuesEdit()
  
      if (
        name === ''||
        service === '' ||
        valor === '' ||
        date === '' ||
        time === ''
      ) {
        throw new Error('Os campos não foram preenchidos')
      }
    },
  
    prepValorer(x) {
      let { name, service, valor, date, time } =
        x != 1 ? Formulario.getValues() : Formulario.getValuesEdit()
  
      date = Utils.formataData(date, time)
  
      return {
        name: name,
        service: service,
        valor: valor,
        date: date,
        time: time
      }
    },
  
    salvaAgendamento(agendamento) {
      manipularAgendamento.add(agendamento)
    },
  
    limpaCamposs() {
      Formulario.name.value = ''
      Formulario.service.value = ''
      Formulario.date.value = ''
      Formulario.time.value = ''
      Formulario.valor.value = ''
  
      Formulario.nameEdit.value = ''
      Formulario.serviceEdit.value = ''
      Formulario.dateEdit.value = ''
      Formulario.timeEdit.value = ''
      Formulario.valorEdit.value = ''
    },
  
    submit(event) {
      event.preventDefault()
      try {
        Formulario.validaCampos()
        const agendamento = Formulario.prepValorer()
        Formulario.salvaAgendamento(agendamento)
        Formulario.limpaCamposs()
        Modal.close()
      } catch (error) {
        alert(error.message)
      }
    },
  
    submitUpdate(event, id) {
      event.preventDefault()
      try {
        Formulario.validaCampos(1)
        const agendamento = Formulario.prepValorer(1)
        manipularAgendamento.salvarAlteracao(agendamento, id)
        Formulario.limpaCamposs()
        ModalEdit.close()
        App.reload()
      } catch (error) {
        alert(error.message)
      }
    }
  }
  
  const App = {
    init() {
      manipularAgendamento.all.forEach(function (agendamento, index) {
        Tabela.adicionarAgendamento(agendamento, index)
      })
    },
    reload() {
      Tabela.limparAgendamentos()
      App.init()
    }
  }
  
  App.init()
  