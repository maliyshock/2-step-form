(function () {
    var sections = {
        firstSectionValidatedInputs: {},
        secondSectionValidatedInputs: {},
        firstSectionRequiredInputs: null,
        secondSectionRequiredInputs: null,

        init: function () {
            this.cacheDom();
            this.bindEvents();
            this.counts();
            this.render();
        },

        cacheDom: function () {
            this.$nextButton = document.getElementsByClassName('js-next')[0],
            this.$finishButton = document.getElementsByClassName('js-finish')[0],
            this.$firstStepSection = document.getElementsByClassName('js-first-step')[0],
            this.$firstSectionInputs = document.getElementsByClassName('js-first-step')[0].getElementsByClassName('js-input'),
            this.$firstSectionRequiredInputs = document.getElementsByClassName('js-first-step')[0].getElementsByClassName('js-required'),
            this.$secondStepSection = document.getElementsByClassName('js-second-step')[0],
            this.$secondSectionInputs = document.getElementsByClassName('js-second-step')[0].getElementsByClassName('js-input'),
            this.$secondSectionrequiredInputs = document.getElementsByClassName('js-second-step')[0].getElementsByClassName('js-required'),
            this.$deliveryArea =  document.getElementsByClassName('js-delivery-area')[0],
            this.$generalTabContent =  document.getElementById('general'),
            this.$adressSection =  document.getElementById('adress'),
            this.$adressTab =  document.getElementsByClassName('js-adress-tab')[0];
            this.$tabs =  document.getElementsByClassName('js-tab');
            this.$tabsArea =  document.getElementsByClassName('js-tabs')[0];
            this.$tabsContent =  document.getElementsByClassName('js-tab-content-container');
        },

        counts: function () {
            this.firstSectionRequiredInputs = this.$firstSectionRequiredInputs.length ;
            this.secondSectionRequiredInputs = this.$secondSectionrequiredInputs.length;
        },

        render: function () {
        },

        bindEvents: function () {
            this.$nextButton.addEventListener('click', function(){
                    this.changeSectionState(false, this.$adressSection);
                    this.changeActiveTab(false, this.$adressTab);
                }.bind(this)
            )

            this.$tabsArea.addEventListener('click', function(e) {
                    if( !e.target.className.match(/\bdisabled\b/) ) {
                        this.changeSectionState(e);
                        this.changeActiveTab(e);
                    }
                }.bind(this)
            )

            this.$firstStepSection.onchange=this.trackFirstSection.bind(this);
            this.$secondStepSection.onchange=this.trackSecondSection.bind(this);

            this.$finishButton.addEventListener('click', function() {
                    this.makeRequest('http://localhost:8000/test.php')
                }.bind(this)
            )
        },

        makeRequest: function (url) {
            var hr = new XMLHttpRequest();
            hr.open("GET", url, true);
            hr.send();

            hr.onreadystatechange = function() {
                if(hr.readyState == 4 && hr.status == 200) {
                    var return_data = JSON.parse( hr.responseText );
                    if ( return_data.success == true ) {
                        alert('Запрос прошел успешно!');
                        location.reload();
                    } else {
                        alert('Что-то пошло не так, попробуйте позже');
                        this.changeButtonAvailability(this.$finishButton, true);
                    }
                }
            }.bind(this)

            this.changeButtonAvailability(this.$finishButton, false);
        },

        trackFirstSection: function(event) {
            event.stopPropagation();

            //check input that have been changed an write it status to obj
            this.checkInput(event, this.firstSectionValidatedInputs);

            // if count of validated inputs >= count of required inputs
            // change button state
            if( this.checkSection(this.firstSectionValidatedInputs, this.firstSectionRequiredInputs) ) {
                this.changeButtonAvailability(this.$nextButton, true);
                this.changeTabAvailability(this.$adressTab, true);
            } else {
                this.changeButtonAvailability(this.$nextButton, false);
                this.changeTabAvailability(this.$adressTab, false);
            }
        },

        trackSecondSection: function (event) {
            event.stopPropagation();

            if ( event.target.className.match(/\bjs-block-togler\b/) === null ) {
                this.checkInput(event, this.secondSectionValidatedInputs);
            } else {
                if (event.target.id == 'delivery') {
                    this.showSection( this.$deliveryArea );
                    this.setRequiredClassTo( this.$secondSectionInputs );
                } else if (event.target.id == 'pickup') {
                    this.hideSection( this.$deliveryArea );
                    this.destroyRequiredClassFrom( this.$secondSectionInputs );
                }
                this.counts();
            }

            if( this.checkSection(this.secondSectionValidatedInputs, this.secondSectionRequiredInputs) ) {
                this.changeButtonAvailability(this.$finishButton, true);
            } else {
                this.changeButtonAvailability(this.$finishButton, false);
            }
        },

        isEmptyObj: function(obj) {
            for(var key in obj) {
                if(obj.hasOwnProperty(key))
                    return false;
            }
            return true;
        },

        showSection: function (obj) {
            obj.classList.remove('dnone');
        },

        hideSection: function (obj) {
            obj.classList.add('dnone');
        },

        destroyRequiredClassFrom: function (htmlSet) {
            for (var i = 0; i < htmlSet.length; i++ ) {
                htmlSet[i].classList.remove('js-required');
                console.log(htmlSet[i]);
            }
        },

        setRequiredClassTo: function (htmlSet) {
            for (var i = 0; i < htmlSet.length; i++ ) {
                htmlSet[i].classList.add('js-required');
            }
        },

        checkInput: function (e, store) {
            var $parent = e.target.parentNode.parentNode;
            var $element = e.target;

            var data = this.getDataFromInput($element);

            if( this.validation(data) ) {
                $parent.classList.remove('error');
                $parent.classList.add('success');

                store[$element.id] = true;
            } else {
                $parent.classList.remove('success');
                $parent.classList.add('error');

                store[$element.id] = false;
            }
        },

        checkSection: function (validatedInputs, requiredInputs) {
            if (requiredInputs > 0 && !this.isEmptyObj( validatedInputs ) ) {
                var countOfValidatedInputs = 0;

                for (var key in validatedInputs) {
                    // if someone == false
                    if ( validatedInputs[key] == false ) {
                        return false;
                    } else {
                        countOfValidatedInputs++;
                    }
                }

                if( countOfValidatedInputs == requiredInputs ){
                    return true;
                } else {
                    return false;
                }
            } else if (requiredInputs > 0 && this.isEmptyObj( validatedInputs ) ) {
                return false;
            } else if (requiredInputs == 0) {
                return true;
            }
        },


        isCorrectPhoneNumber: function (value) {
            var regTemplate = /^((\+7|7|8)+([0-9]){10})$/gm;
            return regTemplate.test(value);
        },

        isCorrectEmail: function (value) {
            var regTemplate = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return regTemplate.test(value);
        },

        isCorrectText: function (value) {
            var regTemplate = /^[A-Za-zА-Яа-я\s]+$/ ;
            return regTemplate.test(value) && value.length <= 255 && value.length > 1;
        },

        isAdressCorrect: function (value) {
            return value.length <= 255 && value.length > 1;
        },

        isCountryCorrect: function (value) {
            return value.length > 0 && value != 'не выбрано';
        },

        isDateCorrect: function (value) {
            var regTemplate = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/;
            return regTemplate.test(value) && value.length < 255 && value.length > 1;
        },

        isPostCodeCorrect: function (value) {
            var regTemplate = /^\d+$/ ;
            return regTemplate.test(value) && value.length <= 6;
        },

        changeButtonAvailability: function (buttonObj, state) {
            if (state){
                buttonObj.removeAttribute('disabled')
            } else {
                buttonObj.setAttribute('disabled', 'disabled')
            }
        },

        changeTabAvailability: function (tabObj, state) {
            if( state ) {
                tabObj.classList.remove('disabled');
            } else {
                tabObj.classList.add('disabled')
            }
        },

        clearTabs: function () {
            for (var i = 0; i <  this.$tabs.length; i++) {
                this.$tabs[i].parentNode.classList.remove('active');
            }
        },

        changeActiveTab: function (e, tab) {
            if (tab) {
                this.clearTabs();
                tab.classList.add('active')
            } else {
                e.preventDefault();

                if (e.target !== e.currentTarget) {
                    this.clearTabs();

                    e.target.parentNode.classList.add('active')
                }
            }
        },

        hideAllSections: function() {
            for (var i = 0; i <  this.$tabsContent.length; i++) {
                this.$tabsContent[i].classList.add('dnone');
            }
        },

        changeSectionState: function(e, section) {
            if (section) {
                this.hideAllSections();
                section.classList.remove('dnone')
            } else {
                e.preventDefault();

                if (e.target !== e.currentTarget) {
                    //go to second section, if tab enabled
                    var z = e.target;
                    var id = e.target.hash;

                    if (id != undefined) {
                        this.hideAllSections();
                    }

                    switch(id){
                        case '#general':
                            this.$generalTabContent.classList.remove('dnone')
                            break;

                        case '#adress':
                            this.$adressSection.classList.remove('dnone')
                            break;

                        default:
                            break;
                    }
                }
                e.stopPropagation();
            }
        },

        validation: function (object) {
            switch (object.type) {
                case 'tel':
                    return this.isCorrectPhoneNumber(object.value);
                    break;

                case 'email':
                    return this.isCorrectEmail(object.value);
                    break;

                case 'date':
                    return this.isDateCorrect(object.value);
                    break;

                case 'postcode':
                    return this.isPostCodeCorrect(object.value);
                    break;

                case 'adress':
                    return this.isAdressCorrect(object.value);
                    break;

                case 'country':
                    return this.isCountryCorrect(object.value);
                    break;

                default:
                    return this.isCorrectText(object.value);
                    break;
            }
        },

        getDataFromInput: function (element) {
            return {'value': element.value, 'type': element.getAttribute('data-type')}
        },

    }

    sections.init();
})();