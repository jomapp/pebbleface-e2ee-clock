module.exports = function(minified) {
    const clayConfig = this;

    function toggleDependencies() {
        const animateMinuteChange = clayConfig.getItemByMessageKey('AnimateMinuteChange');
        const animationSpeed = clayConfig.getItemByMessageKey('AnimationSpeed');

        if (animateMinuteChange.get()) {
            animationSpeed.show();
        } else {
            animationSpeed.hide();
        }
    }

    clayConfig.on(clayConfig.EVENTS.AFTER_BUILD, function() {
        const toggleItem = clayConfig.getItemByMessageKey('AnimateMinuteChange');

        toggleDependencies();

        toggleItem.on('change', toggleDependencies);
    });
};