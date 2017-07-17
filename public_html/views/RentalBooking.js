import { connect } from "react-redux";
import RentalBooking from "../../components/lists/RentalBooking";
import {
  fetchBooking,
  fetchReserveSlotByBookingId,
  removeBooking
} from "../../modules/rentalBooking";
import { fetchUserCategory } from "../../modules/category";

// helper function to have a simpler way to access your state properties
const mapStateToProps = ({ rentalBooking }) => {
  const {
    error,
    loading,
    loadingCalendar,
    list,
    category,
    reserveList
  } = rentalBooking;

  // console.log("reserveList:", reserveList);
  return {
    authError: error,
    loading,
    loadingCalendar,
    list,
    category,
    reserveList
  };
};

export default connect(mapStateToProps, {
  fetchBooking,
  fetchReserveSlotByBookingId,
  fetchUserCategory,
  removeBooking
})(RentalBooking);
