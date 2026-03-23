console.log("V1.0");
		$(document).ready(function () {
			setTimeout(function () {
				document.getElementById('initial-loading').style.display = 'none';

				const form = document.getElementById('dropdown-container');
				if (form) {
					form.style.display = 'block';
				}
			}, 2000);

			console.log("Documento pronto e jQuery carregado.");

			$('.dropdown-btn').on('click', function (e) {
				e.preventDefault();
				e.stopPropagation();
				console.log("Botão do dropdown clicado!");

				var $dropdownContent = $('.dropdown-content');
				var $icon = $(this).find('i');
				$dropdownContent.toggleClass('show');
				console.log("Classe 'show' alternada. Dropdown está visível? ", $dropdownContent.hasClass('show'));

				$icon.toggleClass('fa-chevron-down fa-chevron-up');

				if ($dropdownContent.hasClass('show')) {
					$(this).css('border-radius', '10px 10px 0 0');
				} else {
					$(this).css('border-radius', '10px');
				}
			});

			$(document).on('click', function (e) {
				if (!$(e.target).closest('.dropdown-container').length) {
					var $dropdownContent = $('.dropdown-content');
					if ($dropdownContent.hasClass('show')) {
						console.log("Clique fora do dropdown. Fechando...");
						$dropdownContent.removeClass('show');
						$('.dropdown-btn').find('i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
						$('.dropdown-btn').css('border-radius', '10px');
					}
				}
			});
			$('.dropdown-item').on('click', function () {
				const selectedText = $(this).text().trim();
				const formType = $(this).data('form');
				console.log("Item do dropdown selecionado:", selectedText, "Formulário:", formType);

				$('.selected-text').text(selectedText);
				$('.dropdown-content').removeClass('show');
				$('.dropdown-btn i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
				$('.dropdown-btn').css('border-radius', '10px');

				$('form').hide();
				$(`#${formType}-form`).fadeIn(300);
			});

			$('#btn-sim').on('click', function () {
				console.log("Botão 'Sim' do modal clicado.");
				$('#confirmation-modal').removeClass('show');
				setTimeout(function () {
					$('#confirmation-modal').css('display', 'none');
				}, 300);

				$('form').each(function () {
					this.reset();
					$(this).find('.erro-validacao').hide();
					$(this).find('input, select, textarea').removeClass('campo-invalido');
					$(this).hide();
				});

				$('.dropdown-container').show();
				$('.selected-text').text('Selecione um tipo de requerimento   ');
			});

			$('#btn-nao').on('click', function () {
				console.log("Botão 'Não' do modal clicado. Redirecionando...");
				try {
					location.href = 'https://' + location.host + '/t36391-?view=newest';
				} catch (error) {
					console.error("Erro ao tentar redirecionar:", error);
					alert("Não foi possível redirecionar. Verifique o console para mais detalhes.");
				}
			});

			$('.enviar-btn').click(function () {

				const loadingOverlay = document.createElement('div');
loadingOverlay.className = 'loading-overlay';
loadingOverlay.innerHTML = `
<div class="loading-container">

    <div class="pulse-ring"></div>
    <div class="pulse-ring ring2"></div>
    <div class="pulse-ring ring3"></div>

    <img src="https://i.ibb.co/CpmnwN6M/pmj.png" class="loading-logo">

</div>

<div class="loading-message">Enviando requerimento...</div>
`;
				document.body.appendChild(loadingOverlay);

				const formType = $(this).data('form');
				console.log("formType do botão Enviar:", formType);

				const form = $(`#${formType}-form`);
				let isValid = true;

				form.find('.erro-validacao').hide();
				form.find('input, select, textarea').removeClass('campo-invalido');

				form.find('input[required], select[required], textarea[required]').each(function () {
					if ($(this).val() === '') {
						$(this).addClass('campo-invalido');
						$(this).siblings('.erro-validacao').show();
						isValid = false;
					}

					if ($(this).attr('id') === 'licenca-dias' && parseInt($(this).val()) < 7) {
						$(this).addClass('campo-invalido');
						$(this).siblings('.erro-validacao').show();
						isValid = false;
					}
				});

				if (!isValid) {
					document.body.removeChild(loadingOverlay);
					return;
				}

				let bbcode = gerarBBCode(formType);
				console.log("BBCode gerado:", bbcode);

				if (!bbcode || !bbcode.trim()) {
					document.body.removeChild(loadingOverlay);
					alert("O BBCode ficou vazio.");
					return;
				}

				$(this).text('Enviando...');
				const btn = $(this);

				setTimeout(function () {
					$.post('/post', {
						t: 1,
						message: bbcode,
						mode: 'reply',
						post: 1,
					}).done(function () {
						document.body.removeChild(loadingOverlay);

						$('#confirmation-modal').addClass('show');
						$('#confirmation-modal').css({
							'display': 'flex'
						});

						btn.text('Enviar');
					}).fail(function (xhr, status, error) {
						console.log("BBCode gerado:", bbcode);
						console.log("Status:", status);
						console.log("Erro:", error);
						console.log("Resposta do servidor:", xhr.responseText);

						document.body.removeChild(loadingOverlay);
						alert('Houve um erro ao enviar a postagem! Tente novamente.');
						btn.text('Enviar');
					});
				}, 600);
			});

			const BBCodeTemplates = {
				header: '[font=Poppins][center][table style="border-color: black; border-radius: 10px; overflow: hidden; width: auto;" bgcolor="#4d4c4c"][tr][td][size=16][color=#ffffff][b]{{titulo}}[/b][/color][/center][/size][/font][/td][/tr][/table]',

				content: '[center][size=14][font=Poppins][b][color=black]{{nome}}[/color][/b]{{campos}}[/center][/font][/size]',
				fields: {
					data: '\n[color=black][b]Data[/b][/color]: {{valor}}',
					cargoAtual: '\n[color=black][b]Cargo Atual[/b][/color]: {{valor}}',
					novoCargo: '\n[color=black][b]Novo Cargo[/b][/color]: {{valor}}',
					motivo: '\n[color=black][b]Motivo[/b][/color]: {{valor}}',
					comprovacoes: '\n[color=black][b]Comprovações[/b][/color]: {{valor}}',
					permissao: '\n[color=black][b]Permissão[/b][/color]: {{valor}}',
					quantidadeDias: '\n[color=black][b]Quantidade de Dias[/b][/color]: {{valor}}',
					cargo: '\n[color=black][b]Cargo[/b][/color]: {{valor}}',
					novoNome: '\n[color=black][b]Novo Nome[/b][/color]: {{valor}}'
				},

				atualizacao: `<table class="rank pmj" style="transition: none 0ms ease 0s; margin: 1em; padding: 1.4em; RCC - SÓ A VERDADEIRA-color: rgb(0, 92, 3); width: -webkit-fill-available; height: auto; text-align: center; border-radius: 8px; color: white; border-collapse: collapse; font-family: Roboto, sans-serif; border-width: initial !important; border-style: none !important; border-color: initial !important;"><tbody><tr style="transition: none; border: none; box-sizing: border-box; margin: 0px; padding: 0px;"><td style="transition: none 0ms ease 0s; box-sizing: border-box; margin: 0px; padding: 15px; border-width: initial !important; border-style: none !important; border-color: initial !important;"><img src="https://www.habbo.com.br/habbo-imaging/badge/b09244s43131s50134s17133s17135b1210d8727f4f7f0adf08ed5ab5bd644.gif" alt="PMJ LOGO"><br><font face="Poppins"><font color="white"><span style="font-size: 17px; line-height: normal"><strong>Atualizado por {{tag}}</strong></span></font></font></td></tr></tbody></table>`
			};

			const FormConfigs = {
				entrada: {
					titulo: 'ENTRADA DE MEMBROS',
					campos: ['data']
				},
				promocao: {
					titulo: 'PROMOÇÃO DE MEMBRO',
					campos: ['cargoAtual', 'novoCargo', 'motivo', 'data']
				},
				rebaixamento: {
					titulo: 'REBAIXAMENTO DE MEMBRO',
					campos: ['cargoAtual', 'novoCargo', 'motivo', 'data']
				},
				expulsao: {
					titulo: 'EXPULSÃO DE MEMBRO',
					campos: ['motivo', 'comprovacoes']
				},
				advertencia: {
					titulo: 'ADVERTÊNCIA',
					campos: ['motivo', 'permissao']
				},
				licenca: {
					titulo: 'LICENÇA / RESERVA',
					campos: ['quantidadeDias', 'permissao']
				},
				saida: {
					titulo: 'SAÍDA DE MEMBRO',
					campos: ['motivo', 'permissao']
				},
				prolongamento: {
					titulo: 'PROLONGAMENTO DE LICENÇA',
					campos: ['quantidadeDias', 'permissao']
				},
				retorno: {
					titulo: 'RETORNO DE LICENÇA / RESERVA',
					campos: []
				},
				alteracao: {
					titulo: 'ALTERAÇÃO DE NICKNAME',
					campos: ['cargo', 'novoNome']
				}
			};

			function processTemplate(template, data) {
				return template.replace(/\{\{(\w+)\}\}/g, function (match, key) {
					return data[key] || match;
				});
			}

			function obterDadosFormulario(formType) {
				const dados = {};

				const fieldMappings = {
					entrada: {
						nome: 'entrada-nome',
						data: 'entrada-data'
					},
					promocao: {
						nome: 'promocao-nome',
						cargoAtual: 'promocao-cargo-atual',
						novoCargo: 'promocao-novo-cargo',
						motivo: 'promocao-motivo',
						data: 'promocao-data'
					},
					rebaixamento: {
						nome: 'rebaixamento-nome',
						cargoAtual: 'rebaixamento-cargo-atual',
						novoCargo: 'rebaixamento-novo-cargo',
						motivo: 'rebaixamento-motivo',
						data: 'rebaixamento-data'
					},
					expulsao: {
						nome: 'expulsao-nome',
						motivo: 'expulsao-motivo',
						comprovacoes: 'expulsao-comprovacoes'
					},
					advertencia: {
						nome: 'advertencia-nome',
						motivo: 'advertencia-motivo',
						permissao: 'advertencia-permissao'
					},
					licenca: {
						nome: 'licenca-nome',
						quantidadeDias: 'licenca-dias',
						permissao: 'licenca-permissao'
					},
					saida: {
						nome: 'saida-nome',
						motivo: 'saida-motivo',
						permissao: 'saida-permissao'
					},
					prolongamento: {
						nome: 'prolongamento-nome',
						quantidadeDias: 'prolongamento-dias',
						permissao: 'prolongamento-permissao'
					},
					retorno: {
						nome: 'retorno-nome'
					},
					alteracao: {
						nome: 'alteracao-nome-antigo',
						cargo: 'alteracao-cargo',
						novoNome: 'alteracao-nome-novo'
					},
					atualizacao: {
						tag: 'atualizacao-nome'
					}
				};

				const mapping = fieldMappings[formType];
				if (!mapping) return dados;

				Object.keys(mapping).forEach(key => {
					const elementId = mapping[key];
					const element = document.getElementById(elementId);
					if (element) {
						let valor = element.value;
						if (key === 'data' && valor) {
							valor = formatarData(valor);
						}

						dados[key] = valor;
					}
				});

				return dados;
			}

			function gerarBBCode(formType) {

				if (formType === 'atualizacao') {
					const dados = obterDadosFormulario(formType);
					return processTemplate(BBCodeTemplates.atualizacao, dados);
				}

				const config = FormConfigs[formType];
				if (!config) {
					console.error('Tipo de formulário não encontrado:', formType);
					return '';
				}

				const dados = obterDadosFormulario(formType);
				dados.titulo = config.titulo;

				let bbcode = processTemplate(BBCodeTemplates.header, dados);
				bbcode += '\n\n';

				let campos = '';
				config.campos.forEach(campo => {
					if (dados[campo] && BBCodeTemplates.fields[campo]) {
						const campoTemplate = BBCodeTemplates.fields[campo];
						campos += processTemplate(campoTemplate, { valor: dados[campo] });
					}
				});

				dados.campos = campos + ' ';
				bbcode += processTemplate(BBCodeTemplates.content, dados);

				return bbcode;
			}

			function formatarData(dataISO) {
				if (!dataISO) return '';
				const partes = dataISO.split('-');
				if (partes.length === 3) {
					return `${partes[2]}/${partes[1]}/${partes[0]}`;
				}
				return dataISO;
			}

		});
