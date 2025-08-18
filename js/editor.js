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

			let $character = characterSummary(character, false);

			save('Character Saved', $character.prop('outerHTML'));
			updateCharacter();
		});

		$('#edit').on('change', (e) => {
			if (e.target.checked) {
				setTimeout(() => {
					$('#form')[0].scrollIntoView(true);
				}, 10);
			} else {
				setTimeout(() => {
					$('#show')[0].scrollIntoView(true);
				}, 10);
			}
		});

		$('.nameList').on('change', (e) => {
			e.preventDefault();

			let $list = $(e.target);
			$($list.data('field')).val($list.val());
		});

		$('.randomName').on('click', (e) => {
			e.preventDefault();
			let $button = $(e.target).closest('button');
			randomName($button.data('gender'));
		});

		$('#randomArchetype').on('click', (e) => {
			e.preventDefault();

			let rnd = Math.floor(Math.random() * archetypes.length);
			let archetype = archetypes[rnd];
			$('#archetypeid').val(archetype.archetypeid).trigger('change');
		});

		$('#randomAttributes').on('click', (e) => {
			e.preventDefault();

			const $btn = $(e.target);
			const $section = $btn.closest('section');
			let total = $section.data('total');
			let max = $section.data('max');
			let deck = [];

			for (var a=0; a<attributes.length; a++) {
				let used = $('#attribute_' + attributes[a].toLowerCase()).val() || 0;
				for (var f=used; f<max; f++) {
					total -= used;
					deck.push(attributes[a].toLowerCase());
				}
			}

			// ensure key attribute is at least 2
			let archetypeId = $('#archetypeid').val();
			if (archetypeId) {
				let attribute = false;
				for (var a in archetypes) {
					let archetype = archetypes[a];
					if (archetype.archetypeid == archetypeId) {
						attribute = archetype.attribute.toLowerCase();
					}
				}

				let $key = $('#attribute_' + attribute);
				let value = parseInt($key.val() || 0);
				if (value < 2 && total > 2) {
					total -= 2 - value;
					$key.val(2);
	  				deck.splice(deck.indexOf(attribute.toLowerCase()), 2 - value);
	  			}
			}

			let hand = deal(deck, total);
			for (var h in hand) {
				let $input = $('#attribute_' + hand[h]);
				$input.val(parseInt($input.val() || 0) + 1);
			}

			calculateValues('attributes');
		});

		$('#randomSkills').on('click', (e) => {
			e.preventDefault();

			const $btn = $(e.target);
			const $section = $btn.closest('section');
			let total = $section.data('total');
			let max = $section.data('max');
			let deck = [];

			let list = Object.keys(skills);

			for (var s=0; s<list.length; s++) {
				let used = $('#skill_' + list[s].toLowerCase()).val() || 0;
				total -= used;
				for (var f=used; f<max; f++) {
					deck.push(list[s].toLowerCase());
				}
			}

			// ensure key skills are at least 2
			let attribute = $section.attr('attribute');
			if (attribute) {
				for (var s=0; s<list.length; s++) {
					let skill = list[s].toLowerCase();
					let $input = $('#skill_' + skill);
					let $tr = $input.closest('tr');

					if ($tr.data('attr') == attribute) {
						let value = parseInt($input.val() || 0);
						if (value < 2 && total > 2) {
							total -= 2 - value;
							$input.val(2);
			  				deck.splice(deck.indexOf(skill), 2 - value);
						}
					}
				}
			}

			let hand = deal(deck, total);
			for (var h in hand) {
				let $input = $('#skill_' + hand[h]);
				$input.val(parseInt($input.val() || 0) + 1);
			}

			calculateValues('skills');
		});

		$('.random button').on('click', (e) => {
			e.preventDefault();

			let $button = $(e.target).closest('button');
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

		$('table i').on('click', (e) => {
			const $btn = $(e.target);
			const $input = $btn.closest('tr').find('input');
			const $section = $btn.closest('section');
			let max = $section.data('max');

			const inc = $btn.index() == 0 ? -1 : 1;
			const value = parseInt($input.val() || 0);
			const result = value + inc;

			if (result >= 0 && result <= max) {
				$input.val(value + inc);
				calculateValues($section[0].className);
			}
		});

		$('.reset').on('click', (e) => {
			e.preventDefault();

			const $section = $(e.target).closest('section');
			$section.find('input').val('0');
			calculateValues($section[0].className);
		});

		$('.popup').on('click', (e) => {
			e.preventDefault();

			let $button = $(e.target);
			let title = $button.data('title') || $button.html();
			let id = $button.data('content') || $button.attr('href');
			let content = $(id).html();

			popup(title, content);
		});

		$('#new').on('click', (e) => {
			e.preventDefault();

			$('#form input, #form textarea, #form select').val('');
			$('.attributes').attr('attribute', '');
			$('#strain_points').val('');
			$('#wound_points').val('');
			$('#edit').prop('checked', 'checked');

			updateImage('');

			calculateValues('attributes');
			calculateValues('skills');

			$('#form')[0].scrollIntoView(true);

			streetwise.lastId = '';
		});

		$('#generate').on('submit', (e) => {
			let $form = $(e.target);
			let creations = $('#creations').val();
			let genders = $('#genders').val();
			
			$('#strain_points').val('');
			$('#wound_points').val('');

			for (var c=0; c< creations; c++) {
				streetwise.lastId = '';
				$('#form input, #form textarea').val('');
				$('#form section.attributes input, #form section.skills input').val('0');

				let gender = genders;
				if (gender == 'both') {
					gender = chooseFromList(['boys', 'girls']);
				}
				randomName(gender);

				$('#randomArchetype').trigger('click');
				$('#randomAttributes').trigger('click');
				$('#randomSkills').trigger('click');

				$('fieldset.random button').each((i, button) => {
					$(button).trigger('click');
				});

				$('button.randomImage[data-gender="' + gender + '"]').trigger('click');
				
				let character = getCharacter();
				streetwise.lastId = character.id;
				streetwise.characters[character.id] = character;			
			}		

			updateStorage();
			updateSlots();

			setTimeout(() => {
				$('#generate')[0].scrollIntoView();
			}, 10);	
		});

		$('#backup').on('click', (e) => {
			let $link = $(e.target);
			let time = new Date().getTime();

		    var data = new Blob([JSON.stringify(streetwise)]);
		    $link.attr('href', URL.createObjectURL(data));
		  	$link.attr('download', 'streetwise-' + time + '.json');
		});

		$('#export').on('click', (e) => {
			let $link = $(e.target);
			let character = getCharacter();

		    var data = new Blob([JSON.stringify(character)]);
		    $link.attr('href', URL.createObjectURL(data));
		  	$link.attr('download', character.firstname + '-' + character.lastname + '.json');
		});

		$('#import').on('change', (e) => {
			const files = e.target.files;
			let imported = 0;
			let read = 0;
			let content = '';

			for (let file of files) {
				const reader = new FileReader();

				reader.onload = () => {
					try {
						let json = JSON.parse(reader.result);
						if (json.characters) {
							for (var id in json.characters) {
								let character = json.characters[id];
								streetwise.characters[id] = character;
								content += characterSummary(character).prop('outerHTML');
								imported++;
							}
						} else {
	        				let character = JSON.parse(reader.result);
							streetwise.characters[character.id] = character;
							content += characterSummary(character).prop('outerHTML');
							imported++;
						}
    				} catch (e) {
        				popup('Character Import', 'Error reading ' + file.name);
    				}

    				read++;
					if (read == files.length) {
						save('Character Import', content);
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
				var url = reader.result;
				updateImage(url);
			};

			reader.readAsDataURL(file);
		});

		$('#remove').on('click', (e) => {
			e.preventDefault();

			updateImage('');
		});

		$('#overlay').on('click', (e) => {
			e.preventDefault();

			$popup = $(e.target).closest('#popup');
			if ($popup.length > 0) {
				return;
			}

			closePopup();
		});

		$('#overlay button.close').on('click', (e) => {
			e.preventDefault();

			closePopup();;
		});

		$('#wound_points').on('input', (e) => {
			updateCondition();
			updateField('wound_points', e.target.value);
			updateStorage();
		});

		$('#strain_points').on('input', (e) => {
			updateField('strain_points', e.target.value);
			updateStorage();
		});

		$('#history').on('click', (e) => {
			e.preventDefault();

			if (history.length == 0) {
				popup('Dice History', 'No rolls yet.');
				return;
			}

			let rolls = '<ul class="history nobar"><li>' + history.join('</li><li>') + '</li></ul>';
			popup('Dice History', rolls);
		});

		$('.chooseImage').on('click', (e) => {
			e.preventDefault();

			let gender = $(e.target).closest('button').data('gender');
			let images = [];
			for (i=1; i<=50; i++) {
				let num = String(i).padStart(2, '0');
				images.push(`<img title="${num}" src="images/portraits/${gender}/${num}.jpeg">`);
			}

			let content = '<div class="gallery">' + images.join("\n") + '</div>';

			popup('Choose an image', content);
		});

		$('#jumps a').on('click', (e) => {
			e.preventDefault();

			let $link = $(e.target);
			$($link.attr('href'))[0].scrollIntoView(true);
		});

		$('#characterSwitcher').on('change', (e) => {
			e.preventDefault();

			let id = $(e.target).val();

			loadCharacter(id);
		});

		$('#prevCharacter').on('click', (e) => {
			e.preventDefault();

			cycleCharacter(-1);
		});

		$('#nextCharacter').on('click', (e) => {
			e.preventDefault();

			cycleCharacter(+1);
		});

		$(document).on('click', '.character', (e) => {
			let $button = $(e.target).find('.edit:eq(0)');
			let id = $button.attr('href') || $button.data('href');

			loadCharacter(id);

			if ($('#edit').is(':checked')) {
				$('#form')[0].scrollIntoView(true);
			} else {
				$('#show')[0].scrollIntoView(true);
			}
		});

		$(document).on('click', '.character .edit', (e) => {
			e.preventDefault();
			e.stopPropagation(true, true);

			let $button = $(e.target).closest('.edit');
			let id = $button.attr('href') || $button.data('href');

			loadCharacter(id);

			$('#edit').attr('checked', 'checked');
			$('#form')[0].scrollIntoView(true);
		});

		$(document).on('click', '.character .delete', (e) => {
			e.preventDefault();
			e.stopPropagation(true, true);

			let $button = $(e.target).closest('.delete');
			let id = $button.attr('href') || $button.data('href');

			let character = streetwise.characters[id];
			let body = '<p>' + fullname(character.firstname, character.lastname, character.nickname) + '</p>';
			body += '<div class="buttons center"><button id="delete" data-id="' + id + '">CONFIRM</button></div>';
			popup('Delete Character?', body);
		});

		$(document).on('click', '.gallery img', (e) => {
			e.preventDefault();

			var url = e.target.src;
		    updateImage(url.slice(url.indexOf('images')));

			closePopup();
		});

		$(document).on('click', '.randomImage', (e) => {
			e.preventDefault();
			let gender = $(e.target).closest('button').data('gender');

			let rnd = Math.floor(Math.random() * 50) + 1;
			let num = String(rnd).padStart(2, '0');

			let url = `images/portraits/${gender}/${num}.jpeg`;
		    updateImage(url);

			closePopup();
		});

		$(document).on('click', '#updateNotes', (e) => {
			e.preventDefault();

			updateField('notes', $('#notes').val());
			updateStorage();
			closePopup();
		});

		$(document).on('click', '#updateInventory', (e) => {
			e.preventDefault();

			let items = [];
			$('#popup .inventory input').each((i, item) => {
				items.push(item.value);
			});

			updateField('inventory', items);
			updateStorage();
			closePopup();
		});

		$(document).on('click', '#delete', (e) => {
			e.preventDefault();

			let id = $(e.target).data('id');
			deleteCharacter(id);
		});

		$(document).on('input', '#start', (e) => {
			resetCalc();
		});

		$(document).on('click', '#panic', (e) => {
			e.preventDefault();

			panicRoll();
		});

		$(document).on('click', '[data-roll]', (e) => {
			e.preventDefault();

			const $button = $(e.target); 

			showDice($button.data('title'), $button.data('roll'), $button.data('strain'), $button.data('start'), $button.data('stat'));
		});

		$(document).on('click', '#continue', (e) => {
			e.preventDefault();

			restoreDice();
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

			adjustDice(1);
		});

		$(document).on('click', '#diceDec', (e) => {
			e.preventDefault();

			adjustDice(-1);
		});

		$(document).on('keydown', (e) => {
			if (e.key == 'Escape') {
				closePopup();
			}

			if (e.key == ' ') {
				let $tray = $('#popup #tray');
				if ($tray.length > 0) {
					if ($tray.hasClass('panicked')) {
						$('#continue').trigger('click');
					} else if ($tray.hasClass('panic')) {
						$('#panic').trigger('click');
					} else {
						$('#roll').trigger('click');
					}
				}
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

	function updateStorage() {
		localStorage.streetwise = JSON.stringify(streetwise);
	}

	function save(title, message) {
		updateStorage();
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
			updateImage('');
		} else {
			streetwise = JSON.parse(streetwise);
			loadCharacter(streetwise.lastId);
			updateSlots();
		}

		bind();
	}

	function deal(deck, cards) {
		let hand = [];
		for (var r=0; r<cards; r++) {
			let rnd = Math.floor(Math.random() * deck.length);
			let card = deck[rnd];
			hand.push(card);
			deck.splice(deck.indexOf(card), 1);
		}

		return hand;
	}

	function build() {
		['boys', 'girls'].forEach((gender) => {
			forenames[gender].forEach((name) => {
				$('<option>' + name + '</option>').appendTo('#' + gender + 'names');
			});
		});

		for (let n in surnames) {
			$('<option value="' + surnames[n] + '">' + surnames[n] + '</option>').appendTo('#surnames');
		}

		for (let n in nicknames) {
			$('<option value="' + nicknames[n] + '">' + nicknames[n] + '</option>').appendTo('#nicknames');
		}

		for (let a in archetypes) {
			$('<option value="' + archetypes[a].archetypeid + '">' + archetypes[a].archetype + '</option>').appendTo('#archetypeid');
		}

		for (let a in attributes) {
			let attribute = attributes[a];
			let tr = '<tr data-attr="' + attribute + '"><td>' + attribute + '</td><td width="70px"><input id="attribute_' + attribute.toLowerCase() + '" name="attribute_' + attribute.toLowerCase() + '" value="0" readonly></td><td width="80px"><i>remove</i><i>add</i></td></tr>';
			$(tr).appendTo('.attributes table');
		}

		for (let s in skills) {
			let tr = '<tr data-attr="' + skills[s][0] + '"><td title="' + skills[s][1] + '">' + s + ' (' + skills[s][0] + ')</td><td width="70px"><input id="skill_' + s.toLowerCase() + '" name="skill_' + s.toLowerCase() + '" value="0" readonly></td><td width="80px"><i>remove</i><i>add</i></td></tr>';
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

		if (character.id.indexOf('#') > -1) {
			let storedChacter = currentCharacter();

			character.notes = storedChacter.notes;
			character.inventory = storedChacter.inventory;
		} else {
			character.id = '#' + Math.floor(Math.random() * 10000000).toString(16);
			character.notes = '';
			character.inventory = [];
		}

		return character;
	}

	function currentCharacter() {
		return streetwise.characters[streetwise.lastId];
	}

	function updateField(name, value) {
		return streetwise.characters[streetwise.lastId][name] = value;
	}

	function loadCharacter(id) {
		let character = streetwise.characters[id];
		if (character) {
			streetwise.lastId = id;

			updateFields(character);
			updateAttribute();
			updateCondition();
			calculateValues('attributes');
			calculateValues('skills');

			updateImage(character.image);
			updateCharacter();

			streetwise.lastId = id;
			updateStorage();

			$('#slots li[data-id="' + id + '"]').addClass('active').siblings().removeClass('active');
			$('#characterSwitcher').val(id);
		} else {
			$('#edit').prop('checked', 'checked');
		}
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

		let $picture = $('#show_picture');

		if (character.image) {
			let url = character.image;
			if (url.indexOf('portraits') == -1) {
				const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
					const byteCharacters = atob(b64Data);
					const byteArrays = [];

					for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
						const slice = byteCharacters.slice(offset, offset + sliceSize);

						const byteNumbers = new Array(slice.length);
						for (let i = 0; i < slice.length; i++) {
							byteNumbers[i] = slice.charCodeAt(i);
						}

						const byteArray = new Uint8Array(byteNumbers);
						byteArrays.push(byteArray);
					}

					const blob = new Blob(byteArrays, {type: contentType});
					return blob;
				}

				const blob = b64toBlob(character.image.replace('data:image/jpeg;base64,', ''), 'image/jpeg');
				url = URL.createObjectURL(blob);
		    }

		    $picture.attr('href', url);
		  	$picture.attr('download', character.firstname + '-' + character.lastname + '.jpg');
			$picture.show();
			$('#show_image').prop('src', character.image);

		} else {
			$picture.hide();
		}
	}

	function updateAttribute() {
		$('.attributes').attr('attribute', $('#attribute').val());
		$('.skills').attr('attribute', $('#attribute').val());
	}

	function hasPower(power) {
		let powers = getPowers(currentCharacter());
	
		return powers.includes(power);
	}

	function getPowers(character) {
		let powers = [];		

		character.talents.split(/,\s*/).forEach((talent) => {
			let matches = (talents[talent].match(/\{(.+)\}/));
			if (matches !== null) {
				powers.push(matches[1]);
			}
		});
		
		return powers;
	}

	function getTalents(character) {
		if (!character.talents) {
			return '';
		}

		let list = [];		

		character.talents.split(/,\s*/).forEach((talent) => {
			let desc = talents[talent];
			if (desc) {
				desc = desc.replace(/\{.+\}/, '');
				list.push(`<dt>${talent}:</dt><dd>${desc}</dd>`);
			} else {
				desc = talent;
			}
		});

		return list.join("\n");
	}

	function getAttributes(character, raw) {
		let stats = {};

		attributes.forEach((attribute) => {
			stats[attribute] = parseInt(character['attribute_' + attribute.toLowerCase()] || 0);
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
			let icon = attributeIcons[stat];
			let props = `data-stat="${stat}" data-roll="${stats[stat]}${key}" data-title="${stat} Roll"`;
			list.push(`<dt ${props}><i>${icon}</i>${stat}:</dt>`);
			list.push(`<dd ${props}>${stats[stat]}${key}</dd>`);
		}

		return list.join("\n");
	}

	function getSkills(character) {
		let attrs = getAttributes(character, true);
		let stats = {};

		for (let skill in skills) {
			let attr = skills[skill][0];
			let score = parseInt(attrs[attr]) + parseInt(character['skill_' + skill.toLowerCase()] || 0);
			stats[skill] = score;
		}

		let list = [];
		for (stat in stats) {
			let attr = skills[stat][0];
			let icon = attributeIcons[attr];
			let props = `title="${skills[stat][0]}: ${skills[stat][1]}" data-stat="${attr}" data-roll="${stats[stat]}" data-title="${stat} Roll (${skills[stat][0]})"`;
			list.push(`<dt ${props}><i>${icon}</i>${stat}:</span></dt>`);
			list.push(`<dd ${props}>${stats[stat]}</dd>`);
		}

		return list.join("\n");
	}

	function getQuirks(character) {
		let quirks = '';

		for (q=0; q<=2; q++) {
			if (character['quirk' + q]) {
				quirks += '<p>' + character['quirk' + q] + '</p>';
			}
		}

		return quirks;
	}

	function getBackstory(character) {
		let backstory = '<p>' + character.backstory.replace(/\n+/g, '</p><p>') + '</p>';

		for (e=0; e<=3; e++) {
			if (character['event' + e]) {
				backstory += '<p>' + character['event' + e] + '</p>';
			}
		}

		return backstory;
	}

	function updateFields(data) {
		for (field in data) {
			let value = data[field];

			if (Array.isArray(value)) {
				value = value.join(', ');
			}
			$('#' + field).val(value);
		}
	}

	function updateCondition() {
		let $conditions = $('.conditions li');
		$conditions.removeClass('current');

		wounds = getWounds();
		$conditions.eq(wounds).addClass('current');
	}

	function calculateValues(section) {
		const $section = $('.' + section);
		let used = 0;
		let total = $section.data('total');
		let max   = $section.data('max');

		$section.find('input').each((i, input) => {
			if (input.value !== '') {
				used += parseInt(input.value);
			}
		});

		$section.find('.used').html(used);
		$section.find('.total').html(total);
		$section.find('.max').html(max);

		$section.find('table').toggleClass('maxxed', used == total);
	}

	function characterSummary(character, buttons) {
		let $item = $('<li class="character" data-id="' + character.id + '">');
		if (character.id == streetwise.lastId) {
			$item.addClass('active');
		}

		let name = fullname(character.firstname, character.lastname, character.nickname);

		let $edit = $('<a class="edit" href="' + character.id + '">');
		if (character.image) {
			let = $image = $('<span class="image" title="' + character.firstname + '">');
			$image.css('backgroundImage', 'url(\'' + character.image + '\')').appendTo($edit);
		} else {
			$('<span class="noimage" title="No image">').appendTo($edit);
		}
		$edit.appendTo($item);

		let $text = $('<div class="text">');
		let $details = $('<div>');
		$('<h3><a class="edit" href="' + character.id + '">' + name + '</a></h3>').appendTo($details);
		$('<p>' + character.archetype + '</p>').appendTo($details);
		$details.appendTo($text);

		if (buttons) {
			let $buttons = $('<div class="buttons">');
			$('<button class="minor edit" data-href="' + character.id + '"><i>edit</i></button>').appendTo($buttons);
			$('<button class="minor delete" data-href="' + character.id + '"><i>delete</i></button>').appendTo($buttons);
			$buttons.appendTo($text);
		}

		$text.appendTo($item);

		return $item;
	}

	function cycleCharacter(direction) {
		let $switcher = $('#characterSwitcher');
		let options = $switcher.find('option').length - 1;
		let ndx = $switcher.prop('selectedIndex') + direction;

		if (ndx < 0) {
			ndx = options;
			$switcher.prop('selectedIndex', ndx - 1);
		}

		if (ndx > options) {
			ndx = 0;
		}

		$switcher.prop('selectedIndex', ndx).trigger('change');
	}

	function updateSlots() {
		let $switcher = $('#characterSwitcher');
		let $slots = $('#slots');

		$switcher.html('');
		$slots.html('');

		for (c in streetwise.characters) {
			let character = streetwise.characters[c];
			let name = fullname(character.firstname, character.lastname, character.nickname);
			let $item = characterSummary(character, true);

			if (character.id == streetwise.lastId) {
				$item.addClass('active');
			}

			$item.appendTo($slots);

			$(`<option value="${character.id}">${name}</option>`).appendTo($switcher);
		}

		$switcher.val(streetwise.lastId);
	}

	function popup(title, message) {
		$('#popupTitle').html(title);

		if (message && message.indexOf('<') == -1) {
			message = '<p>' + message + '</p>';
		}

		$('#popupContent').html(message);

		$('html').addClass('popup');

		let character = currentCharacter();

		setTimeout(() => {
			$('#popupContent .populate').each((e, el) => {
				$input = $(el);
				let value = character[$input.attr('id')];
				if (Array.isArray(value)) {
					let ndx = $input.parent().index();
					$input.val(value[ndx]);	
				} else {
					$input.val(value);
				}
			})
		},10);
	}

	function closePopup() {
		$('html').removeClass('popup');
		$('#popupContent').html('');
	}

	function getWounds() {
		let wounds = $('#wound_points').val() || 0;

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

	function updateImage(url) {
		$('#image').val(url);

		if (url) {
			$('#preview').css('backgroundImage', `url(${url})`).removeClass('noimage');
			$('#remove').show();
		} else {
			$('#preview').css('backgroundImage', '').addClass('noimage');
			$('#remove').hide();
		}
	}

	function randomName(gender) {
		$('#firstname').val(chooseFromList(forenames[gender]));
		$('#lastname').val(chooseFromList(surnames));
		$('#nickname').val(chooseFromList(nicknames));
	}

	function chooseFromList(list) {
		let rnd = Math.floor(Math.random() * list.length);
		return list[rnd];
	}

	function showDice(title, dice, useStrain, start, stat) {
		dice = parseInt(dice);

		popup(title, '');

		let $tray = $('#hidden #tray').clone().appendTo('#popupContent');
		let $dice = $tray.find('#dice');
		let $die = $('#hidden #dieSlot');
		$tray.data('stat', stat);
		$dice.html('');

		for (d=0; d<dice; d++) {
			let $new = $die.clone();
			if (useStrain === false) {
				$new.addClass('added').prop('title', 'Modifier');
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

			$('#popup #warning').hide();

			let strain = getStrain();
			if (strain > 0) {
				for (d=0; d<strain; d++) {
					$die.clone().addClass('strain').prop('title', 'Strain').appendTo($dice);
				}
			}

			let wounds = getWounds();
			for (w=0; w<wounds; w++) {
				$tray.find('#dieSlot').eq(w).addClass('disabled').prop('title', 'Disabled');
			}
		}

		resetCalc();
	}

	function resetCalc() {
		dice = $('#popup .die').length;

        $('#total').html(dice + 'd6');
        $('#result').html('?');
	}

    function adjustDice(dice, addClass) {
        let $dice = $('#popup #dice');

        if (dice > 0) {
        	let $disabled = $dice.find('.disabled');
        	if ($disabled.length > 0) {
            	$disabled.last(0).removeClass('disabled');
            } else {
	            let $die = $('#hidden #dieSlot');
	            if (!addClass) {
	            	addClass = 'added';
	            }
	            $die.clone().addClass(addClass).attr('title',addClass).appendTo($dice);
	        }
        } else {
        	let $all = $dice.find('.die');
            if ($all.length == 1) {
            	return;
            }
        	let $added = $dice.find('.added');
        	if ($added.length > 0) {
            	$added.last(0).remove();
            } else {
            	let $other = $dice.find('#dieSlot:not(.disabled)');
            	if ($other.length > 0) {
            		$other.eq(0).addClass('disabled');
            	}
            }
        }

        resetCalc();
    }

    function panicLevel(score) {
    	let level = panic.length-1;
    	while (score < panic[level].min) {
    		level--;
    	}

    	return panic[level].desc;
    }

    function restoreDice() {
		let $title = $('#popup #popupTitle');
		$title.html($title.data('title'));

		let $tray = $('#popup #tray');
		$tray.removeClass('panicking').removeClass('panicked');
		$tray.find('.panic').remove();
    }

    function panicRoll() {
    	adjustDice(1, 'panic');
		$('#popup #tray').removeClass('panic').addClass('panicking');

		let $title = $('#popup #popupTitle');
		$title.data('title', $title.html()).html('Panic Roll!');

		let start = $('#strain_points').val();
		$('#popup #start').val(start);

		let $roll = $('#roll');

		let $tray = $('#popup #tray');
		let $die = $('#popup #dieSlot.panic .die');
		let $slot = $die.closest('#dieSlot');
		let total = 0;
		let result = 0;

		setTimeout(() => {
			const face = Math.floor(Math.random() * 6) + 1;
			$die.addClass('rolled').attr('data-rolled', face);
			total = face;
			result = parseInt(start) + total;
			$('#total').html(total);
			$('#result').html(result + ' (' + panicLevel(result) + ')');

			let time = new Date().toLocaleTimeString();
			let title = 'Panic Roll (' + panicLevel(result) + ')';
			let roll = `${start} + ${total} = ${result}`;

			history.unshift(`${time} ${title}: <i>earthquake</i> ${roll}`);

			$tray.addClass('panicked');
		}, 500);
    }

	function rollDice(reroll) {
		$('#roll').attr('disabled', 'disabled');

		let $tray = $('#popup #tray');
		let $dice = $('#popup .die');
		let $warning = $('#popup #warning');

		if (reroll) {
			addStrain(1);
			$tray.find('#dieSlot:has([data-rolled="1"]), #dieSlot:has([data-rolled="6"])').addClass('keep').prependTo('#popup #dice');
			$dice = $('#popup .die');
			let pushes = parseInt($tray.data('pushes') || 0) + 1;
			$tray.data('pushes', pushes);
			$warning.hide();
			$('#adjustDice').hide();
		}

		let $success = $('#popup #success');
		$success.html('0');

		let $failure = $('#popup #failure');
		$failure.html('0');

		let start = $('#popup #start').val() || 0;

		let successes = 0;
		let failures = 0;
		let warnings = 0;
		let timer = 0;
		let total = 0;
		let result = 0;
		let panic = false;
		let stat = $tray.data('stat');

		$dice.each((d, die) => {
			let $die = $(die);
			let $slot = $die.closest('#dieSlot');
			let rolling = true;

			if (reroll) {
				if ($die.attr('data-rolled') == 1) {
					rolling = false;
					failures++;
					$failure.html(failures);
					$slot.addClass('failure');
				}

				if ($die.attr('data-rolled') == 6) {
					rolling = false;
					successes++;
					$success.html(successes);
				}
			}
			
			if ($slot.hasClass('disabled')) {
				rolling = false;
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
						$slot.addClass('success');
						successes++;
						$success.html(successes);
					}
					if (face == 1) {
						if ($slot.hasClass('strain')) {
							panic = true;
							$slot.addClass('failure');
						}
						if (reroll) {
							$slot.addClass('failure');
							failures++;
							$failure.html(failures);
							addStrain(1);
						} else {
							warnings++;
							$warning.html(warnings).show();
						}
					}
					$die.addClass('rolled').attr('data-rolled', face);

					if (d == $dice.length - 1) {
						$('#roll').removeAttr('disabled');
						let time = new Date().toLocaleTimeString();
						let title = '<i>' + attributeIcons[stat] + '</i>' + $('#popupTitle').html();
						let roll = '';

						if ($tray.hasClass('halos')) {
							let pushes = parseInt($tray.data('pushes') || 0) + 1;
							if (pushes > 0) {
								title += ' #' + pushes;
							}

							roll += `${$dice.length}d6; Success: ${successes}; Strain: ${failures}`;

							if (panic) {
								$tray.addClass('panic');
							}

							let label = 'Push';
							let maxPushes = 1;

							if (hasPower('Push2:' + stat)) {
								maxPushes = 2;
								label += ` #${pushes}/${maxPushes}`;
							}

							if (pushes <= maxPushes) {
								$('#popup #roll').html('<i>replay</i> ' + label).data('push', true);
							} else {
								$('#popup #roll').attr('disabled', 'disabled').hide();
							}
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
			} else {
				if (d == $dice.length - 1) {
					$('#roll').removeAttr('disabled');
				}
			}
		});

		$success.html(successes);
		$failure.html(failures);
	}
});
