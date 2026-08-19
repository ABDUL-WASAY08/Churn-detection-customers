


const GetHeath=async (req,res)=>{
  try {
    return res.status(200).json({
        success:true,
        data:{
            message: "healthy"
        },
        error:null
    });
  } catch (error) {
    res.status(500).json({
        success:false,
        data: null,
        error: {
            message: error.message
        }
    })
  }
}

// get api controller

export default {GetHeath}