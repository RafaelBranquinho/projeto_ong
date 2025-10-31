document.addEventListener('DOMContentLoaded', () => {

    // Elementos principais da "casca"
    const appRoot = document.getElementById('app-root');
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');

    // ===================================================================
    // 1. REQUISITO: Sistema de SPA (Single Page Application) Básico
    // ===================================================================

    // Mapeia o 'data-page' (do link) para o arquivo HTML (o "template")
    const routes = {
        'inicio': 'pages/inicio.html',
        'projetos': 'pages/projetos.html',
        'cadastro': 'pages/cadastro.html',
        'contato': null // 'contato' é um link de âncora especial
    };

    /**
     * Carrega o conteúdo da página (template) via fetch
     */
    async function loadPage(page) {
        // Se a rota for 'contato', apenas rola para o rodapé
        if (page === 'contato') {
            document.getElementById('contato').scrollIntoView({ behavior: 'smooth' });
            return;
        }

        const path = routes[page];
        if (!path) {
            console.error(`Rota não encontrada: ${page}`);
            loadPage('inicio'); // Carrega a página inicial como padrão
            return;
        }

        try {
            // 1. Busca o conteúdo do arquivo HTML
            const response = await fetch(path);
            if (!response.ok) throw new Error('Falha ao carregar a página.');
            
            const html = await response.text();
            
            // 2. Injeta o HTML dentro do <main id="app-root">
            appRoot.innerHTML = html;
            
            // 3. REQUISITO: Sistema de templates JavaScript
            //    Executa scripts específicos para a página que acabamos de carregar
            executePageScripts(page);
            
            // Atualiza o link ativo no menu
            updateActiveLink(page);
            
            // Fecha o menu hambúrguer no mobile após clicar
            if (navMenu.classList.contains('is-active')) {
                navMenu.classList.remove('is-active');
                navToggle.classList.remove('is-active');
            }

        } catch (error) {
            console.error('Erro ao carregar página:', error);
            appRoot.innerHTML = '<div class="container"><p>Erro ao carregar o conteúdo. Tente novamente.</p></div>';
        }
    }

    /**
     * Atualiza qual link está com a classe 'active' no menu
     */
    function updateActiveLink(page) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Lida com cliques nos links da navegação
     */
    function handleNavClick(event) {
        // Encontra o link clicado, mesmo que clique no ícone dentro dele
        const targetLink = event.target.closest('.nav-link');
        
        if (targetLink) {
            event.preventDefault(); // Impede a navegação padrão
            const page = targetLink.dataset.page;
            
            // Atualiza o hash (URL) sem recarregar, exceto para 'contato'
            if (page !== 'contato') {
                window.location.hash = page;
            } else {
                loadPage('contato'); // Apenas rola para o contato
            }
        }
    }

    /**
     * Lida com a mudança de hash na URL (ex: F5, link direto, botão "voltar")
     */
    function handleHashChange() {
        // Pega o hash (ex: #inicio) e remove o '#'
        const page = window.location.hash.substring(1) || 'inicio';
        
        if (routes[page] !== undefined) {
            loadPage(page);
        } else {
            loadPage('inicio'); // Página padrão
        }
    }

    // ===================================================================
    // 2. REQUISITO: Sistema de "Templates" e Validação
    // ===================================================================

    /**
     * Executa scripts específicos DEPOIS que o HTML da página é carregado
     */
    function executePageScripts(page) {
        if (page === 'cadastro') {
            // A página de cadastro precisa inicializar as máscaras e a validação
            initCadastroPage();
        }
    }

    /**
     * Inicializa todas as lógicas da página de Cadastro
     */
    function initCadastroPage() {
        const form = document.getElementById('cadastro-form');
        if (!form) return; // Segurança

        // 1. Ativa as Máscaras (IMask.js)
        try {
            IMask(document.getElementById('cep'), { mask: '00000-000' });
            IMask(document.getElementById('cpf'), { mask: '000.000.000-00' });
            IMask(document.getElementById('telefone'), {
                mask: [
                    { mask: '(00) 0000-0000' },
                    { mask: '(00) 00000-0000' }
                ]
            });
        } catch (e) {
            console.warn("IMask.js não foi carregado ou falhou.", e);
        }

        // 2. REQUISITO: Sistema de verificação de consistência (JS)
        form.addEventListener('submit', function(event) {
            // Impede o envio real do formulário
            event.preventDefault();

            if (validateForm(form)) {
                // Se tudo estiver válido
                alert('Formulário enviado com sucesso! (Simulação)');
                form.reset();
                form.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
            } else {
                // Se houver erros
                alert('Por favor, corrija os erros no formulário.');
            }
        });
    }

    /**
     * REQUISITO: Função de validação de consistência via JavaScript
     * Retorna 'true' se o formulário for válido, 'false' se não.
     */
    function validateForm(form) {
        let isFormValid = true;
        const inputs = form.querySelectorAll('[required]'); // Pega todos que são obrigatórios

        inputs.forEach(input => {
            // Limpa classes antigas
            input.classList.remove('is-valid', 'is-invalid');

            // Usa a API de validação do HTML5 (checkValidity)
            // que já verifica 'required', 'minlength', 'pattern', 'type=email', etc.
            if (input.checkValidity()) {
                input.classList.add('is-valid');
            } else {
                input.classList.add('is-invalid');
                isFormValid = false; // Marca o formulário todo como inválido
            }
        });

        return isFormValid;
    }


    // ===================================================================
    // 3. INICIALIZAÇÃO
    // ===================================================================

    // Adiciona o listener para o menu hambúrguer
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('is-active');
        navToggle.classList.toggle('is-active');
    });

    // Adiciona o listener para os cliques na navegação (para o roteador)
    document.querySelector('.main-header').addEventListener('click', handleNavClick);
    
    // Adiciona o listener para mudanças de hash (F5, voltar, etc.)
    window.addEventListener('hashchange', handleHashChange);

    // Carrega a página inicial ou a página do hash assim que o DOM carregar
    handleHashChange();
});