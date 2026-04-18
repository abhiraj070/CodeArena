import mongoose,{Schema} from 'mongoose'
import bcrypt from 'bcrypt'
import JWT from 'jsonwebtoken'

const userSchema= Schema({
    fullName:{
        type: String,
        required: true,
        trim: true
    },
    username:{
        type:String,
        unique: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        lowercase:true
    },
    password:{
        type: String,
        required: true
    },
    language:{
        type: String,
        enum: ["javascript", "python", "cpp", "java", "typescript"],
        default: "cpp"
    },
    isOnline:{
        type: Boolean,
        default: false
    },
    bio:{
        type: String,
        default: ""
    },
    refreshToken: {
        type: String
    },
    profilePicture:{
        type: String
    },
    recentlyConnectedWith:[{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }],
})

userSchema.pre("save", async function () {
    if(!this.isModified("password")){
        return
    }
    this.password= await bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function () {
    return JWT.sign(
        {
            _id: this._id,
            fullName: this.fullName,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function () {
    return JWT.sign(
        {
            _id: this._id,
            fullName: this.fullName,
            email: this.email
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User= mongoose.model("User",userSchema)