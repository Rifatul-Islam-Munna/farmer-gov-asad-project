import 'user.model.dart';

class ProfileResponseModel {
  const ProfileResponseModel({required this.data});

  final UserModel data;

  factory ProfileResponseModel.fromJson(Map<String, dynamic> json) {
    final dataJson = json['data'];
    return ProfileResponseModel(
      data: UserModel.fromJson(
        dataJson is Map<String, dynamic> ? dataJson : const <String, dynamic>{},
      ),
    );
  }

  Map<String, dynamic> toJson() => {'data': data.toJson()};
}
