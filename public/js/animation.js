/**
 * Created by kinnplh on 10/26/16.
 */
function clearInto() {
    console.log('clear');
    $('body').addClass('frosted-clear');
}
function blurOut() {
    console.log("blur");
    $('body').removeClass('frosted-clear');
    $('body').addClass('frosted-blur')
}