/**
 * ============================================================
 * GERADOR DE QR CODE PROFISSIONAL
 * ============================================================
 * 
 * Funcionalidades:
 * - Gerar QR Codes a partir de texto/URL
 * - Customizar tamanho do QR
 * - Escolher cores do QR e fundo
 * - Download em PNG e SVG
 * - Copiar para clipboard
 * - Validação e feedback visual
 * - Interface responsiva
 * ============================================================
 */

// ============================================================
// VARIÁVEIS GLOBAIS
// ============================================================

// Elementos do DOM (inputs e botões)
const qrInput = document.getElementById('qrInput');
const qrSizeSelect = document.getElementById('qrSize');
const colorQRInput = document.getElementById('colorQR');
const colorBgInput = document.getElementById('colorBg');
const gerarBtn = document.getElementById('gerarBtn');

// Elementos de saída
const outputCard = document.getElementById('outputCard');
const qrCodeBox = document.getElementById('qrCodeBox');
const successMessage = document.getElementById('successMessage');
const inputFeedback = document.getElementById('inputFeedback');

// Botões de download e ações
const downloadPngBtn = document.getElementById('downloadPngBtn');
const downloadSvgBtn = document.getElementById('downloadSvgBtn');
const copyBtn = document.getElementById('copyBtn');
const novoBtn = document.getElementById('novoBtn');

// Instância do QR Code (biblioteca QRCode.js)
let qrCodeInstance = null;

// ============================================================
// INICIALIZAÇÃO
// ============================================================

/**
 * Inicializa os event listeners quando o DOM está pronto
 */
document.addEventListener('DOMContentLoaded', function() {
    // Botão gerar QR Code
    gerarBtn.addEventListener('click', gerarQRCode);
    
    // Enter no input também gera QR Code
    qrInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            gerarQRCode();
        }
    });
    
    // Limpa feedback ao digitar
    qrInput.addEventListener('input', function() {
        inputFeedback.textContent = '';
        inputFeedback.className = 'feedback';
    });
    
    // Atualiza QR Code em tempo real quando cores/tamanho mudam
    colorQRInput.addEventListener('change', regenerarQRCode);
    colorBgInput.addEventListener('change', regenerarQRCode);
    qrSizeSelect.addEventListener('change', regenerarQRCode);
    
    // Botões de download
    downloadPngBtn.addEventListener('click', downloadQRCodePNG);
    downloadSvgBtn.addEventListener('click', downloadQRCodeSVG);
    copyBtn.addEventListener('click', copiarQRCode);
    
    // Botão para gerar novo
    novoBtn.addEventListener('click', resetarFormulario);
});

// ============================================================
// FUNÇÕES PRINCIPAIS
// ============================================================

/**
 * Valida o input do usuário
 * @param {string} valor - Texto a ser validado
 * @returns {boolean} - true se válido, false caso contrário
 */
function validarInput(valor) {
    if (valor.trim() === '') {
        inputFeedback.textContent = '❌ Digite algo para gerar o QR Code!';
        inputFeedback.className = 'feedback error';
        return false;
    }
    
    // Máximo de 1000 caracteres (limite do padrão QR)
    if (valor.length > 1000) {
        inputFeedback.textContent = '⚠️ Texto muito longo! Use até 1000 caracteres.';
        inputFeedback.className = 'feedback error';
        return false;
    }
    
    return true;
}

/**
 * Gera o QR Code com os dados inseridos
 */
function gerarQRCode() {
    const texto = qrInput.value.trim();
    
    // Valida o input
    if (!validarInput(texto)) {
        return;
    }
    
    // Limpa QR Code anterior
    qrCodeBox.innerHTML = '';
    
    try {
        // Obtém as configurações
        const tamanho = parseInt(qrSizeSelect.value);
        const colorQR = colorQRInput.value;
        const colorBg = colorBgInput.value;
        
        // Valida contraste entre as cores (melhor UX)
        if (!validarContraste(colorQR, colorBg)) {
            inputFeedback.textContent = '⚠️ Cores muito similares! Aumente o contraste.';
            inputFeedback.className = 'feedback error';
            return;
        }
        
        // Cria nova instância do QR Code
        // Usando a biblioteca QRCode.js (https://github.com/davidshimjs/qrcodejs)
        qrCodeInstance = new QRCode(qrCodeBox, {
            text: texto,
            width: tamanho,
            height: tamanho,
            colorDark: colorQR,      // Cor do QR Code
            colorLight: colorBg,     // Cor do fundo
            correctLevel: QRCode.CorrectLevel.H  // Nível máximo de correção de erro
        });
        
        // Mostra o card de saída
        outputCard.style.display = 'block';
        successMessage.style.display = 'block';
        inputFeedback.textContent = '✅ QR Code gerado com sucesso!';
        inputFeedback.className = 'feedback success';
        
        // Scroll suave para o QR Code gerado
        setTimeout(() => {
            outputCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
        
    } catch (erro) {
        console.error('Erro ao gerar QR Code:', erro);
        inputFeedback.textContent = '❌ Erro ao gerar QR Code. Tente novamente.';
        inputFeedback.className = 'feedback error';
    }
}

/**
 * Regenera o QR Code com novas cores/tamanho mantendo o texto anterior
 */
function regenerarQRCode() {
    const texto = qrInput.value.trim();
    
    // Só regenera se houver um QR Code gerado
    if (texto && outputCard.style.display !== 'none') {
        gerarQRCode();
    }
}

/**
 * Valida o contraste entre duas cores (usando luminância)
 * @param {string} cor1 - Cor em formato hex
 * @param {string} cor2 - Cor em formato hex
 * @returns {boolean} - true se contraste é suficiente
 */
function validarContraste(cor1, cor2) {
    // Converte hex para RGB
    const rgb1 = hexToRgb(cor1);
    const rgb2 = hexToRgb(cor2);
    
    // Calcula luminância relativa
    const luminancia1 = calcularLuminancia(rgb1);
    const luminancia2 = calcularLuminancia(rgb2);
    
    // Calcula razão de contraste
    const maiorLuminancia = Math.max(luminancia1, luminancia2);
    const menorLuminancia = Math.min(luminancia1, luminancia2);
    const razaoContraste = (maiorLuminancia + 0.05) / (menorLuminancia + 0.05);
    
    // Padrão WCAG AA recomenda razão >= 4.5
    return razaoContraste >= 3;
}

/**
 * Converte cor hex para RGB
 * @param {string} hex - Cor em formato #RRGGBB
 * @returns {object} - Objeto com propriedades r, g, b
 */
function hexToRgb(hex) {
    const resultado = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return resultado ? {
        r: parseInt(resultado[1], 16),
        g: parseInt(resultado[2], 16),
        b: parseInt(resultado[3], 16)
    } : null;
}

/**
 * Calcula luminância de uma cor RGB
 * @param {object} rgb - Objeto com propriedades r, g, b
 * @returns {number} - Luminância relativa
 */
function calcularLuminancia(rgb) {
    // Normaliza os valores para 0-1
    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;
    
    // Aplica fórmula de luminância do padrão WCAG
    r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// ============================================================
// FUNÇÕES DE DOWNLOAD
// ============================================================

/**
 * Download do QR Code em formato PNG
 */
function downloadQRCodePNG() {
    if (!qrCodeInstance) {
        alert('Gere um QR Code primeiro!');
        return;
    }
    
    try {
        // Obtém o canvas do QR Code
        const canvas = qrCodeBox.querySelector('canvas');
        
        if (!canvas) {
            alert('Erro ao gerar PNG. Tente novamente.');
            return;
        }
        
        // Cria link de download
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `qrcode-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (erro) {
        console.error('Erro ao baixar PNG:', erro);
        alert('Erro ao baixar PNG. Tente novamente.');
    }
}

/**
 * Download do QR Code em formato SVG
 */
function downloadQRCodeSVG() {
    if (!qrCodeInstance) {
        alert('Gere um QR Code primeiro!');
        return;
    }
    
    try {
        // Obtém o SVG do QR Code
        const svg = qrCodeBox.querySelector('svg');
        
        if (!svg) {
            alert('Erro ao gerar SVG. Tente novamente.');
            return;
        }
        
        // Clona o SVG para evitar modificações no original
        const svgClone = svg.cloneNode(true);
        
        // Serializa o SVG para string
        const svgString = new XMLSerializer().serializeToString(svgClone);
        
        // Cria blob e força o download
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qrcode-${Date.now()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
    } catch (erro) {
        console.error('Erro ao baixar SVG:', erro);
        alert('Erro ao baixar SVG. Tente novamente.');
    }
}

/**
 * Copia o QR Code para a área de transferência
 */
function copiarQRCode() {
    try {
        const canvas = qrCodeBox.querySelector('canvas');
        
        if (!canvas) {
            alert('Canvas não encontrado!');
            return;
        }
        
        // Converte canvas para blob
        canvas.toBlob(function(blob) {
            // Cria item da clipboard com a imagem
            const item = new ClipboardItem({ 'image/png': blob });
            
            // Copia para clipboard
            navigator.clipboard.write([item]).then(() => {
                // Feedback visual
                const textoOriginal = copyBtn.textContent;
                copyBtn.textContent = '✅ Copiado!';
                setTimeout(() => {
                    copyBtn.textContent = textoOriginal;
                }, 2000);
            }).catch(() => {
                alert('Erro ao copiar. Seu navegador pode não suportar essa função.');
            });
        }, 'image/png');
        
    } catch (erro) {
        console.error('Erro ao copiar:', erro);
        alert('Erro ao copiar QR Code para clipboard.');
    }
}

// ============================================================
// FUNÇÕES DE RESET/LIMPEZA
// ============================================================

/**
 * Reseta o formulário e limpa o QR Code gerado
 */
function resetarFormulario() {
    // Limpa os inputs
    qrInput.value = '';
    inputFeedback.textContent = '';
    inputFeedback.className = 'feedback';
    
    // Reseta seletores
    qrSizeSelect.value = '300';
    colorQRInput.value = '#000000';
    colorBgInput.value = '#ffffff';
    
    // Limpa o QR Code
    qrCodeBox.innerHTML = '';
    outputCard.style.display = 'none';
    qrCodeInstance = null;
    
    // Foca no input
    qrInput.focus();
    
    // Scroll suave para o top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// COMPATIBILIDADE E POLYFILLS
// ============================================================

/**
 * Polyfill para navegadores que não suportam URLSearchParams
 */
if (typeof URLSearchParams === 'undefined') {
    window.encodeURIComponent = function(str) {
        return str.replace(/[!'()*]/g, function(c) {
            return '%' + c.charCodeAt(0).toString(16);
        });
    };
}

// ============================================================
// LOG DE INICIALIZAÇÃO
// ============================================================

console.log('✅ Gerador de QR Code iniciado com sucesso!');
console.log('📚 Biblioteca utilizada: QRCode.js v1.0.0');
console.log('🎨 Tema: Responsivo e Moderno');
