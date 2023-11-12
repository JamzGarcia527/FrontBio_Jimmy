import Swal from "sweetalert2"

export default Swal.mixin({
  confirmButtonText: 'Aceptar',
  customClass: { confirmButton: 'btn-primary-swal' },
})
