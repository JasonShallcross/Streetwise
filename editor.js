$(() => {
	let streetwise = localStorage.streetwise;
	let history = [];

	init();

	function bind() {
		$('#form').on('submit', (e) => {
			e.preventDefault();

			let character = getCharacter();

			streetwise.lastId = character.id;
			streetwise.characters[character.id] = character;

			save('Character Saved', fullname(character.firstname, character.lastname, character.nickname));
			updateCharacter();
		});

		$('#names').on('change', (e) => {
			e.preventDefault();

			let name = names[e.target.selectedIndex - 1];
			$('#firstname').val(name[0]);
			$('#lastname').val(name[1]);
			$('#nickname').val(name[2]);
		});

		$('#randomName').on('click', (e) => {
			e.preventDefault();

			let rnd = Math.floor(Math.random() * names.length);
			let name = names[rnd];
			$('#firstname').val(name[0]);
			$('#lastname').val(name[1]);
			$('#nickname').val(name[2]);
		});

		$('.random button').on('click', (e) => {
			e.preventDefault();

			let $button = $(e.target);
			let $field = $('#' + $button.data('field'));
			let list = window[$button.data('list')];

			let rnd = Math.floor(Math.random() * list.length);
			$field.val(list[rnd]);
		});

		$('#archetypeid').on('change', (e) => {
			e.preventDefault();

			let archetype = archetypes[e.target.selectedIndex - 1];
			updateFields(archetype);
			updateAttribute();
		});

		$('table span').on('click', (e) => {
			const $btn = $(e.target);
			const $input = $btn.closest('tr').find('input');
			const $section = $btn.closest('section');

			const inc = $btn.index() == 0 ? 1 : -1;
			const result = parseInt($input.val()) + inc;

			if (result >= 0 && result <= 3) {
				$input.val(parseInt($input.val()) + inc);
				calculateValues($section[0].className);
			}
		});

		$('.reset').on('click', (e) => {
			e.preventDefault();

			const $section = $(e.target).closest('section');
			$section.find('input').val('0');
			calculateValues($section[0].className);
		});

		$('#slots').on('click', 'a', (e) => {
			e.preventDefault();

			let $link = $(e.target);
			let id = $link.attr('href');

			if ($link.hasClass('delete')) {
				deleteCharacter(id);
			} else {
				loadCharacter(id);
				streetwise.lastId = id;
				localStorage.streetwise = JSON.stringify(streetwise);
			}
		});

		$('#new').on('click', (e) => {
			e.preventDefault();

			$('#form input, #form textarea').val('');
			$('.attributes').attr('attribute', '');
			$('#preview').hide();
		    $('#remove').hide();
		    $('#image').val('');
			$('#edit').prop('checked', 'checked');

			calculateValues('attributes');
			calculateValues('skills');
		});

		$('#export').on('click', (e) => {
			$link = $(e.target);

			let character = getCharacter();

		    var data = new Blob([JSON.stringify(character)]);
		    $link.attr('href', URL.createObjectURL(data));
		  	$link.attr('download', character.firstname + '-' + character.lastname + '.json');
		});

		$('#import').on('change', (e) => {
			const files = e.target.files;
			let imported = 0;
			let read = 0;

			for (let file of files) {
				const reader = new FileReader();

				reader.onload = () => {
					try {
        				let character = JSON.parse(reader.result);
						streetwise.characters[character.id] = character;
						imported++;
    				} catch (e) {
        				popup('Character Import', 'Error reading ' + file.name);
    				}

    				read++;
					if (read == files.length) {
						save('File Import', 'Characters Imported: ' + imported);
					}
				};

				if (file.type == 'application/json') {
  					reader.readAsText(file);
  				} else {
  					popup('Character Import', 'Error reading: ' + file.name + ' (' + file.type + ')');
  				}
    		}
		});

		$('#upload').on('change', (e) => {
			const file = e.target.files[0];
			const reader = new FileReader();

			if (file.type != 'image/jpeg') {
				popup('Image Upload', 'Please ensure the image is in JPG format: ' + file.name + ' (' + file.type + ')');
			}

			if (file.size > 100000) {
				popup('Image Upload', 'Please ensure the image is less than 100Kb');
				return;
			}

			reader.onload = () => {
				var dataURL = reader.result;
			    $('#preview').show().prop('src', dataURL);
			    $('#image').val(dataURL);
			    $('#remove').show();
			};

			reader.readAsDataURL(file);
		});

		$('#remove').on('click', (e) => {
			e.preventDefault();

			$('#preview').hide();
			$('#remove').hide();
			$('#image').val('');
		});

		$('#overlay').on('click', (e) => {
			e.preventDefault();

			$popup = $(e.target).closest('#popup');
			if ($popup.length > 0) {
				return;
			}

			$('html').removeClass('popup');
		});

		$('#overlay button.close').on('click', (e) => {
			e.preventDefault();

			$('html').removeClass('popup');
		});

		$('#wound_points').on('input', (e) => {
			streetwise.characters[streetwise.lastId].wound_points = e.target.value;

			localStorage.streetwise = JSON.stringify(streetwise);
		});

		$('#strain_points').on('input', (e) => {
			streetwise.characters[streetwise.lastId].strain_points = e.target.value;

			localStorage.streetwise = JSON.stringify(streetwise);
		});

		$('#history').on('click', (e) => {
			e.preventDefault();

			if (history.length == 0) {
				popup('Dice History', 'No rolls yet.');
				return;
			}

			let rolls = '<ul class="history"><li>' + history.join('</li><li>') + '</li></ul>';
			popup('Dice History', rolls);
		});

		$(document).on('input', '#start', (e) => {
			resetCalc();
		});

		$(document).on('click', '[data-roll]', (e) => {
			e.preventDefault();
			const $button = $(e.target); 

			showDice($button.data('title'), $button.data('roll'), $button.data('strain'), $button.data('start'));
		});

		$(document).on('click', '#roll', (e) => {
			e.preventDefault();

			if ($(e.target).data('push')) {
				rollDice(true);
			} else {
				rollDice(false);
			}
		});

		$(document).on('click', '#diceInc', (e) => {
			e.preventDefault();

			incDice(1);
		});

		$(document).on('click', '#diceDec', (e) => {
			e.preventDefault();

			incDice(-1);
		});

		$(document).on('keydown', (e) => {
			if (e.key == 'Escape') {
				$('html').removeClass('popup');
			}

			const shortcuts = ['s', 'e'];

			if (!e.ctrlKey && !e.metaKey) {
				return;
			}

			if (!shortcuts.includes(e.key)) {
				return;
			}
			
			e.preventDefault();

			if (e.key == 's') {
				$('#form').trigger('submit');
			}

			if (e.key == 'e') {
				$('#edit').trigger('click');
			}
		});
	}

	function save(title, message) {
		localStorage.streetwise = JSON.stringify(streetwise);
		updateSlots();

		setTimeout(() => {
			popup(title, message);
		}, 100);
	}

	function init() {
		build();

		if (streetwise === undefined) {
			streetwise = {
				'lastId': null,
				'characters': {}
			}

			$('#edit').prop('checked', 'checked');
		} else {
			streetwise = JSON.parse(streetwise);
			loadCharacter(streetwise.lastId);
			updateSlots();
		}

		bind();
	}

	function build() {
		for (let n in names) {
			$('<option>' + fullname(names[n][0], names[n][1], names[n][2]) + '</option>').appendTo('#names');
		}

		for (let a in archetypes) {
			$('<option value="' + archetypes[a].archetypeid + '">' + archetypes[a].archetype + '</option>').appendTo('#archetypeid');
		}

		for (let a in attributes) {
			let attribute = attributes[a];
			let tr = '<tr><td>' + attribute + '</td><td><input id="attribute_' + attribute.toLowerCase() + '" name="attribute_' + attribute.toLowerCase() + '" value="0" readonly></td><td><span>+</span> <span>-</span></td></tr>';
			$(tr).appendTo('.attributes table');
		}

		for (let s in skills) {
			let tr = '<tr><td title="' + skills[s][1] + '">' + s + ' (' + skills[s][0] + ')</td><td><input id="skill_' + s.toLowerCase() + '" name="skill_' + s.toLowerCase() + '" value="0" readonly></td><td><span>+</span> <span>-</span></td></tr>';
			$(tr).appendTo('.skills table');
		}	
	}

	function fullname(firstname, lastname, nickname) {
		let parts = [];

		if (firstname) {
			parts.push(firstname);
		}

		if (nickname) {
			parts.push('"' + nickname + '"');
		}

		if (lastname) {
			parts.push(lastname);
		}

		return parts.join(' ');
	}

	function getCharacter() {
		let character = Object.fromEntries(new FormData(document.getElementById('form')));

		character.wound_points = $('#wound_points').val();
		character.strain_points = $('#strain_points').val();

		if (character.id.indexOf('#') === -1) {
			character.id = '#' + Math.floor(Math.random() * 10000000).toString(16);
		}

		return character;
	}

	function loadCharacter(id) {
		let character = streetwise.characters[id];
		streetwise.lastId = id;

		updateFields(character);
		updateAttribute();
		calculateValues('attributes');
		calculateValues('skills');

		if (character.image) {
			$('#preview').show().prop('src', character.image);
			$('#remove').show();
		} else {
			$('#preview').hide();
			$('#remove').hide();
		}
		updateCharacter();
	}

	function deleteCharacter(id) {
		let character = streetwise.characters[id];
		delete streetwise.characters[id];
		save('Character Deleted', fullname(character.firstname, character.lastname, character.nickname));
	}

	function updateCharacter() {
		let character = getCharacter();

		$('#show_fullname').html(fullname(character.firstname, character.lastname, character.nickname));
		$('#show_archetype').html(character.archetype);
		$('#show_talents').html(getTalents(character));
		$('#show_attributes').html(getAttributes(character));
		$('#show_skills').html(getSkills(character));
		$('#show_quirks').html(getQuirks(character));
		$('#show_backstory').html(getBackstory(character));

		if (character.image) {
			$('#show_picture').show();
			$('#show_image').prop('src', character.image);
		} else {
			$('#show_picture').hide();
		}
	}

	function updateAttribute() {
		$('.attributes').attr('attribute', $('#attribute').val());
	}

	function getTalents(character) {
		let list = [];

		character.talents.split(',').forEach((talent) => {
			list.push(`<dt>${talent}:</dt><dd>${talents[talent]}</dd>`);
		});

		return list.join("\n");
	}

	function getAttributes(character, raw) {
		let stats = {};

		attributes.forEach((attribute) => {
			stats[attribute] = parseInt(character['attribute_' + attribute.toLowerCase()]);
		});

		if (character.attribute) {
			stats[character.attribute]++;
		}

		if (raw) {
			return stats;
		}

		let list = [];
		for (stat in stats) {
			let key = (stat == character.attribute) ? '*' : '';
			list.push(`<dt data-roll="${stats[stat]}${key}" data-title="${stat} Roll">${stat}:</dt><dd data-roll="${stats[stat]}${key}" data-title="${stat} Roll">${stats[stat]}${key}</dd>`);
		}

		return list.join("\n");
	}

	function getSkills(character) {
		let attrs = getAttributes(character, true);
		let stats = {};

		for (let skill in skills) {
			let attr = skills[skill][0];
			let score = parseInt(attrs[attr]) + parseInt(character['skill_' + skill.toLowerCase()]);
			stats[skill] = score;
		}

		let list = [];
		for (stat in stats) {
			list.push(`<dt title="${skills[stat][1]}" data-roll="${stats[stat]}" data-title="${stat} Roll (${skills[stat][0]})">${stat}:</span></dt><dd data-roll="${stats[stat]}" data-title="${stat} Roll (${skills[stat][0]})">${stats[stat]}</dd>`);
		}

		return list.join("\n");
	}

	function getQuirks(character) {
		let quirks = '';

		for (q=0; q<=2; q++) {
			if (character['quirk' + q]) {
				quirks += '<p>' + character['quirk' + q] + '.</p>';
			}
		}

		return quirks;
	}

	function getBackstory(character) {
		let backstory = '<p>' + character.backstory.replace(/\n+/g, '</p><p>') + '</p>';

		for (e=0; e<=3; e++) {
			if (character['event' + e]) {
				backstory += '<p>' + character['event' + e] + '.</p>';
			}
		}

		return backstory;
	}

	function updateFields(data) {
		for (field in data) {
			let value = data[field];

			$('#' + field).val(value);
		}
	}

	function calculateValues(section) {
		const $section = $('.' + section);
		let used = 0;
		let total = $section.data('max');

		$section.find('input').each((i, input) => {
			if (input.value !== '') {
				used += parseInt(input.value);
			}
		});

		$section.find('.used').html(used);
		$section.find('.total').html(total);

		$section.find('table').toggleClass('maxxed', used == total);
	}

	function updateSlots() {
		$('#slots').html('');

		for (c in streetwise.characters) {
			let character = streetwise.characters[c];
			let $link = $('<li><a class="delete" href="' + character.id + '">X</a> <a class="edit" href="' + character.id + '">' + fullname(character.firstname, character.lastname, character.nickname) + '</a></li>').appendTo('#slots');
		}
	}

	function popup(title, message) {
		$('#popupTitle').html(title);
		$('#popupContent').html(message);
		$('html').addClass('popup');
	}

	function getWounds() {
		let wounds = $('#wound_points').val();
		if (wounds == '') {
			wounds = 0;
		}

		return parseInt(wounds);
	}

	function getStrain() {
		let strain = $('#strain_points').val() || 0;

		return parseInt(strain);
	}

	function addStrain(points) {
		let strain = getStrain() + parseInt(points);

		$('#strain_points').val(strain).trigger('input');
	}

	function showDice(title, dice, useStrain, start) {
		dice = parseInt(dice);

		popup(title, '');

		let $tray = $('#hidden #tray').clone().appendTo('#popupContent');
		let $dice = $tray.find('#dice');
		let $die = $('#hidden #dieSlot');
		$dice.html('');

		for (d=0; d<dice; d++) {
			let $new = $die.clone();
			if (useStrain === false) {
				$new.addClass('added');
			}

			$new.appendTo($dice);
		}

		if (start) {
			$('#start').val($(start).val());
		} else {
			$('#start').val(0);
		}

		if (useStrain === false) {
			$tray.addClass('total');
		} else {
			$tray.addClass('halos');

			let strain = getStrain();
			if (strain > 0) {
				for (d=0; d<strain; d++) {
					$die.clone().addClass('strain').appendTo($dice);
				}
			}
		}

		resetCalc();
	}

	function resetCalc() {
		dice = $('#popup .die').length;

        $('#total').html(dice + 'd6');
        $('#result').html('?');
	}

    function incDice(dice) {
        let $dice = $('#popup #dice');

        if (dice > 0) {
            let $die = $('#hidden #dieSlot');
            $die.clone().addClass('added').appendTo($dice);
        } else {
            $dice.find('#dieSlot.added:last(0)').remove();
        }

        resetCalc();
    }

	function rollDice(reroll) {
		$('#roll').attr('disabled', 'disabled');

		let $tray = $('#popup #tray');
		let $dice = $('#popup .die');

		if (reroll) {
			addStrain(1);
			$tray.find('#dieSlot:has([data-rolled="6"])').addClass('keep').prependTo('#popup #dice');
			$dice = $('#popup .die');
			let pushes = parseInt($tray.data('pushes') || 0) + 1;
			$tray.data('pushes', pushes);
		}

		let $success = $('#success');
		$success.html('0');

		let $failure = $('#failure');
		$failure.html('0');

		let start = $('#start').val() || 0;

		let successes = 0;
		let failures = 0;
		let timer = 0;
		let total = 0;
		let result = 0;

		$dice.each((d, die) => {
			let $die = $(die);
			let rolling = true;

			if (reroll) {
				if ($die.attr('data-rolled') == 6) {
					rolling = false;
					successes++;
					$success.html(successes);
				}
			}

			if (rolling) {
				$die.removeClass('rolled');
				$die.attr('data-rolled', '');

				timer += 500;
				setTimeout(() => {
					const face = Math.floor(Math.random() * 6) + 1;
					total += face;
					result = parseInt(start) + total;
					$('#total').html(total);
					$('#result').html(result);

					if (face == 6) {
						successes++;
						$success.html(successes);
					}
					if (face == 1) {
						failures++;
						$failure.html(failures);
						addStrain(1);
					}
					$die.addClass('rolled').attr('data-rolled', face);

					console.log('editor.js; line:671; d, $dice.length:', d, $dice.length);
					if (d == $dice.length - 1) {
						$('#roll').removeAttr('disabled');
						let time = new Date().toLocaleTimeString();
						let title = $('#popupTitle').html();
						let roll = '';

						if ($tray.hasClass('halos')) {
							let pushes = parseInt($tray.data('pushes') || 0) + 1;
							$('#popup #roll').html('push #' + pushes).data('push', true);

							if (pushes > 0) {
								title += ' #' + pushes;
							}
							roll += `${$dice.length}d6; Success: ${successes}; Strain: ${failures};`;
						} else {
							if (start > 0) {
								roll = `${start} + ${$dice.length}d6 (${total}) = ${result}`;
							} else {
								roll += `${$dice.length}d6 = ${result}`;
							}
						}

						history.unshift(`${time} ${title}: ${roll}`);
					}
				}, timer);
			}
		});

		$success.html(successes);
		$failure.html(failures);
	}
});
