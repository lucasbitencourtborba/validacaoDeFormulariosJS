export function valida(input) { // input corresponde ao elemento html.
    // Extraindo o data-tipo do input, ou seja, const tipoDeInput = dataNascimento.
    const tipoDeInput = input.dataset.tipo

    // Se validadores[dataNascimento] existir, executar a função declarada como valor desse atributo.
    if(validadores[tipoDeInput]){
        validadores[tipoDeInput](input)
    }

    if (input.validity.valid) {
        input.parentElement.classList.remove('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = ''
    } else {
        input.parentElement.classList.add('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = mostrarMensagemDeErro(tipoDeInput, input)
    }

}

const tiposDeErro = [
    'valueMissing',
    'typeMismatch',
    'patternMismatch',
    'customError'
]

const mensagemDeErro = {
    nome: {
    valueMissing: 'O campo de nome não pode estar vazio'
},
    email: {
        valueMissing: 'O campo de email não pode estar vazio.',
        typeMismath: 'O email digitado não é válido.'
    },
    senha: {
        valueMissing: 'O campo de senha não pode estar vazio.',
        patternMismatch: '- A senha deve conter entre 6-12 caracteres uma letra maiúscula e minúscula um número não deve conter símbolos'
    },
    dataNascimento: {
        valueMissing: 'O campo de data não pode estar vazio.',
        customError: 'Você deve ser maior de idade para se cadastrar'
    },
    cpf: {
        valueMissing: 'O campo de CPF não pode estar vazio',
        customError: 'O CPF digitado não é válido'
    },
    cep: {
        valueMissing: 'O campo CEP não pode estar vazio',
        patternMismatch: 'O CEP digitado não é válido',
        customError: 'Não foi possível buscar o CEP especificado.'
    },
    logradouro: {
        valueMissing: 'O campo logradouro não pode estar vazio'
    },
    estado: {
        valueMissing: 'O campo estado não pode estar vazio'
    },
    cidade: {
        valueMissing: 'O campo cidade não pode estar vazio'
    },
    preco: {
        valueMissing: 'O campo preço não pode estar vazio'
    }
}

const validadores = {
    dataNascimento: input => validarDataNascimento(input),
    cpf: input => validaCPF(input),
    cep: input => recuperarCEP(input)
}


function mostrarMensagemDeErro(tipoDeInput, input) {
    let mensagem = ''
    tiposDeErro.forEach(erro =>{
        if(input.validity[erro]){
            mensagem = mensagemDeErro[tipoDeInput][erro]
        }
    })
    return mensagem
}


function validarDataNascimento(input) {
    const dataRecebida = new Date(input.value)
    let mensagem = ''
    
    if (!maiorQue18(dataRecebida)){
        mensagem = 'Você precisa ser maior de idade'
    }

    input.setCustomValidity(mensagem) // Muda a mensagem de alerta que aparece no campo
}

function maiorQue18(data){
    const dataAtual = new Date()
    const dataMais18 = new Date(data.getUTCFullYear() + 18, data.getUTCMonth(), data.getUTCDate())

    return dataMais18 <= dataAtual
}

const nome = document.getElementById('nome')

function validaCPF(input){
    const cpfFormatado = input.value.replace(/\D/g, '')
    let mensagem = ''

    if(!checaCpfRepetido(cpfFormatado) || !checarEstrutura(cpfFormatado)){
        mensagem = 'O CPF digitado não é válido'
    }
    
    input.setCustomValidity(mensagem)
}

function checaCpfRepetido(cpf) {
    const valoresRepetidos = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999'
    ]

    let cpfValido = true

    valoresRepetidos.forEach(valor => {
        if(valor == cpf){
            cpfValido = false
        }
    })
    
    return cpfValido
}

function checarEstrutura(cpf){
    const multiplicador = 10
    
    return checarDigitoVerificador(cpf, multiplicador)
}
// Funções para checar o cpf com fórmula matematica validadora de CPF
function checarDigitoVerificador (cpf, multiplicador){
    if (multiplicador >= 12){
        return true
    }
    
    let multiplicadorInicial = multiplicador
    let soma = 0
    const cpfSemDigitos = cpf.substr(0, multiplicador - 1).split('')
    const digitoVerificador = cpf.charAt(multiplicador - 1)

    for(let contador = 0; multiplicadorInicial > 1; multiplicadorInicial--){
        soma = soma + cpfSemDigitos[contador] * multiplicadorInicial
        contador++
    }

    if(digitoVerificador == confirmaDigito(soma)) {
        return checarDigitoVerificador(cpf, multiplicador + 1)
    }
}

function confirmaDigito(soma){
    return 11 - (soma % 11)
}

function recuperarCEP(input){
    const cep = input.value.replace(/\D/g, '')
    const url = `https://viacep.com.br/ws/${cep}/json`
    const options = {
        method: 'GET',
        mode: 'cors',
        headers: {
            'content-type': 'application/json;charset=utf-8'
        }
    }

    if(!input.validity.patternMismatch && !input.validity.valueMissing) {
        fetch(url,options).then(
            response => response.json()
        ).then(
            data => {
                if (data.erro) {
                    input.setCustomValidity('Não foi possível buscar o CEP')
                    return
                }
                input.setCustomValidity('')
                preencherCamposComCEP(data)
                return
            }
        ) 
        }
}

function preencherCamposComCEP(data) {
    const logradouro = document.querySelector('[data-tipo="logradouro"]')
    const cidade = document.querySelector('[data-tipo="cidade"]')
    const estado = document.querySelector('[data-tipo="estado"]')

    logradouro.value = data.logradouro
    cidade.value = data.localidade
    estado.value = data.uf
}